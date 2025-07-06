let { repo } = require("../config.json");
let { fetchSync } = require("fetch");
let fs = require("fs");
let { extractSync } = require("extract-zip");

let pully = module.require("../", "lazy");

function pullSync(packages, log) {
    if (log) console.info("Resolving dependencies...");

    let explicits;
    if (fs.existsSync("storage/pully/explicits.json")) {
        explicits = require("/storage/pully/explicits.json");
    } else {
        explicits = {};
    }

    let explicitPulls = {};
    for (let name of packages) {
        if (explicits[name] == undefined && fs.existsSync(`modules/${name}`)) {
            console.error(
                `${name} is not installed with pully, please remove package first.`,
            );
            console.error("No packages updated.");
            return;
        }

        explicitPulls[name] = true;
        if (explicits[name] == false) {
            explicits[name] = true;
        }
    }

    let remoteIndex = pully.indexSync();
    let localManifests = pully.getLocalManifestsSync();

    for (let manifest of Object.values(localManifests)) {
        if (remoteIndex[manifest.name] == undefined) {
            console.warn(
                `Package ${manifest.name} does not exist at remote, it will not be updated.`,
            );
        }
    }

    let manifestsToPull = packages.map((package) =>
        pully.manifestSync(package),
    );
    let upToDate = pully.getUpToDateSync(remoteIndex, localManifests);

    let manifestsOfPackagesToPull = {};

    Object.assign(
        manifestsOfPackagesToPull,
        pully.packageManifestsSync(
            pully.getOutdatedSync(remoteIndex, localManifests),
            remoteIndex,
        ),
    );

    let missing = pully.missingSync(localManifests, remoteIndex);
    if (Array.isArray(missing)) {
        console.error(
            `These required modules could not be found on repository: ${missing.join(", ")}.`,
        );
        console.error("No packages updated.");
        return;
    }

    Object.assign(manifestsOfPackagesToPull, missing);

    Object.assign(
        manifestsOfPackagesToPull,
        pully.dependenciesSync(manifestsToPull, upToDate),
    );

    for (let name of Object.keys(manifestsOfPackagesToPull)) {
        if (explicits[name] == undefined && fs.existsSync(`modules/${name}`)) {
            console.error(
                `${name} is not installed with pully, please remove package before updating it.`,
            );
            console.error("No packages updated.");
            return;
        } else if (fs.existsSync(`modules/${name}/.git`)) {
            console.error(
                `${name} is a Git repository, it will not be updated for protection.`,
            );
            console.error("No packages updated.");
            return;
        }
    }

    let urls = Object.values(manifestsOfPackagesToPull).map((manifest) => [
        manifest.name,
        `${repo}/packages/${manifest.name}/releases/${manifest.version}.zip`,
    ]);

    if (fs.existsSync("storage/pully/pulling")) {
        fs.unlinkSync("storage/pully/pulling");
    }

    fs.mkdirSync("storage/pully/pulling");

    let installedCount = 0;

    let renames = [];

    for (let [name, url] of urls) {
        try {
            if (log) console.info(`Installing ${name}`);

            let res = fetchSync(url);

            if (!res.ok()) {
                console.error(
                    `Download failed for ${name}, returned status code ${res.status()}.`,
                );
                console.error("No packages updated.");
                fs.unlinkSync("storage/pully/pulling");
                return;
            }

            let bytes = res.bytes();
            extractSync({ bytes }, `storage/pully/pulling/${name}`);

            let packagePath = pully.findPackageSync(
                `storage/pully/pulling/${name}`,
            );

            if (packagePath === undefined) {
                console.error(`Failed to locate package.json for ${name}.`);
                console.error(`No packages updated.`);
                fs.unlinkSync("storage/pully/pulling");
                return;
            }

            renames.push([packagePath, `modules/${name}`]);
            explicits[name] ||= explicitPulls[name] == true;
            installedCount++;
        } catch (error) {
            console.error(`Failed to install ${name}, expect troubles.`);
            console.error(error);
        }
    }

    for (let [old, to] of renames) {
        if (fs.existsSync(to)) {
            fs.unlinkSync(to);
        }
        fs.renameSync(old, to);
    }

    let order = pully.orderSync(manifestsOfPackagesToPull);

    for (let toLoad of order) {
        try {
            if (localManifests[toLoad]) {
                try {
                    pully.unloadSync(toLoad);
                } catch (e) {
                    console.warn(
                        `An error occured when running stop for ${toLoad}. Cause: ${e}`,
                    );
                }
            }
            pully.loadSync(toLoad);
        } catch (e) {
            console.warn(
                `An error occured when running init for ${toLoad}. Cause: ${e}`,
            );
        }
    }

    if (log) {
        if (installedCount == 0) {
            console.warn("No packages updated.");
        } else {
            console.info(
                `Pulled ${installedCount} package${installedCount > 1 ? "s" : ""}.`,
            );
        }
    }

    fs.writeFileSync(
        "storage/pully/explicits.json",
        JSON.stringify(explicits, null, 2),
    );
    fs.unlinkSync("storage/pully/pulling");
}

function pull(packages, log) {
    return Promise(() => pullSync(packages, log));
}

module.exports = {
    pullSync,
    pull,
};
