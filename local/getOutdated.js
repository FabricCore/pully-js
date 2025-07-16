function isOutdated(currentVersion, newVersion) {
    for (
        let i = 0;
        i < Math.min(currentVersion.length, newVersion.length);
        i++
    ) {
        if (currentVersion[i] > newVersion[i]) return false;
        if (currentVersion[i] < newVersion[i]) return true;
    }

    return currentVersion.length < newVersion.length;
}

function getOutdatedSync(index, localManifests) {
    let out = [];

    for (let manifest of Object.values(localManifests)) {
        let localVersion = manifest.version.split(".").map((n) => parseInt(n));

        if (index[manifest.name] == undefined) {
            continue;
        }

        let remoteVersion = index[manifest.name].version
            .split(".")
            .map((n) => parseInt(n));

        if (isOutdated(localVersion, remoteVersion)) {
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
        let localVersion = manifest.version.split(".").map((n) => parseInt(n));

        if (index[manifest.name] == undefined) {
            continue;
        }

        let remoteVersion = index[manifest.name].version
            .split(".")
            .map((n) => parseInt(n));

        if (!isOutdated(localVersion, remoteVersion)) {
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
