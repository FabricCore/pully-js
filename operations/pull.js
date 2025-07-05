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
    packages = packages.filter((name) => {
        if (explicits[name] == undefined && fs.existsSync(`modules/${name}`)) {
            console.warn(
                `${name} is not installed with pully, please remove package before updating it.`,
            );
            return false;
        }

        explicitPulls[name] = true;
        if (explicits[name] == false) {
            explicits[name] = true;
        }

        return true;
    });

    let remoteIndex = pully.indexSync();
    let localManifests = pully.getLocalManifestsSync();

    let manifestsToPull = packages.map((package) =>
        pully.manifestSync(package),
    );
    let upToDate = pully.getUpToDateSync(remoteIndex, localManifests);

    let manifestsOfPackagesToPull = pully.dependenciesSync(
        manifestsToPull,
        upToDate,
    );

    Object.assign(
        manifestsOfPackagesToPull,
        pully.packageManifestsSync(
            pully.getOutdatedSync(remoteIndex, localManifests),
            remoteIndex,
        ),
    );

    for (let name of Object.keys(manifestsToPull)) {
        if (explicits[name] == undefined && fs.existsSync(`modules/${name}`)) {
            console.warn(
                `${name} is not installed with pully, please remove package before updating it.`,
            );
            delete manifestsToPull[name];
        } else if (fs.existsSync(`modules/${name}/.git`)) {
            console.warn(
                `${name} is a Git repository, it will not be updated for protection.`,
            );
            delete manifestsToPull[name];
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

    for (let [name, url] of urls) {
        try {
            if (log) console.info(`Installing ${name}`);

            let res = fetchSync(url);

            if (!res.ok()) {
                console.error(
                    `Download failed for ${name}, returned status code ${res.status()}.`,
                );
                console.error("Expect trouble");
                continue;
            }

            let bytes = res.bytes();
            extractSync({ bytes }, `storage/pully/pulling/${name}`);

            let packagePath = pully.findPackageSync(
                `storage/pully/pulling/${name}`,
            );

            if (packagePath === undefined) {
                console.error(`Failed to locate package.json for ${name}`);
                console.error(`Failed to install ${name}, expect troubles.`);
                continue;
            }

            if (fs.existsSync(`modules/${name}`)) {
                fs.unlinkSync(`modules/${name}`);
            }
            fs.renameSync(packagePath, `modules/${name}`);
            explicits[name] ||= explicitPulls[name] == true;
            installedCount++;
        } catch (error) {
            console.error(`Failed to install ${name}, expect troubles.`);
            console.error(error);
        }
    }

    if (log)
        console.info(
            `${installedCount} package${installedCount > 1 ? "s" : ""} installed.`,
        );

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
