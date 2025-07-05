function getOutdatedSync(index, localManifests) {
    let out = [];

    for (let manifest of Object.values(localManifests)) {
        let localVersion = manifest.version;

        if (index[manifest.name] == undefined) {
            console.warn(
                `Package ${manifest.name} does not exist at remote, it will not be updated.`,
            );
            continue;
        }

        let remoteVersion = index[manifest.name].version;

        if (
            localVersion.split(".").map(parseInt) <
            remoteVersion.split(".").map(parseInt)
        ) {
            out.push(manifest.name);
        }
    }

    return out;
}

function getOutdated(index, localManifests) {
    return Promise(() => getOutdatedSync(index, localManifests));
}

function getUpToDateSync(index, localManifests) {
    let out = [];

    for (let manifest of Object.values(localManifests)) {
        let localVersion = manifest.version;

        if (index[manifest.name] == undefined) {
            console.warn(
                `Package ${manifest.name} does not exist at remote, it will not be updated.`,
            );
            continue;
        }

        let remoteVersion = index[manifest.name].version;

        if (
            localVersion.split(".").map((n) => parseInt(n)) >=
            remoteVersion.split(".").map((n) => parseInt(n))
        ) {
            out.push(manifest.name);
        }
    }

    return out;
}

function getUpToDate(index, localManifests) {
    return Promise(() => getUpToDateSync(index, localManifests));
}

module.exports = {
    getOutdated,
    getOutdatedSync,
    getUpToDate,
    getUpToDateSync,
};
