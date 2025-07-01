let { repo } = require("../config.json");
let { fetchSync } = require("fetch");
let fs = require("fs");
let { extractSync } = require("extract-zip");

let pully = module.require("../", "lazy");

function pullSync(packages, log) {
    if (log) console.info("Resolving dependencies...");

    let remoteIndex = pully.indexSync();
    let localManifests = pully.getLocalManifestsSync();

    let manifestsToPull = packages.map((package) =>
        pully.manifestSync(package),
    );
    let upToDate = new Set(pully.getUpToDateSync(remoteIndex, localManifests));

    let manifestsOfPackagesToPull = pully.dependenciesSync(
        manifestsToPull,
        upToDate,
    );

    let urls = Object.values(manifestsOfPackagesToPull).map((manifest) => [
        manifest.name,
        `${repo}/packages/${manifest.name}/releases/${manifest.version}.zip`,
    ]);

    if (fs.existsSync("storage/pully/pulling")) {
        fs.unlinkSync("storage/pully/pulling");
    }

    fs.mkdirSync("storage/pully/pulling");

    for (let [name, url] of urls) {
        try {
            if (log) console.info(`Downloading ${name}`);

            let res = fetchSync(url);

            if (!res.ok()) {
                console.error(
                    `Download failed for ${name}, returned status code ${res.status()}.`,
                );
                console.error("Expect trouble");
                continue;
            }

            let bytes = res.bytes();
            if (log) console.info(`Installing ${name}`);
            extractSync({ bytes }, `storage/pully/pulling/${name}`);

            let packagePath = pully.findPackageSync(
                `storage/pully/pulling/${name}`,
            );

            if (packagePath === undefined) {
                console.error(`Failed to locate package.json for ${name}`);
                console.error(`Failed to install ${name}, expect troubles.`);
                continue;
            }

            fs.renameSync(packagePath, `modules/${name}`);

            if (log) console.info(`Installed ${name}.`);
        } catch (error) {
            console.error(`Failed to install ${name}, expect troubles.`);
            console.error(error);
        }
    }

    fs.unlinkSync("storage/pully/pulling");
}

module.exports = {
    pullSync,
};
