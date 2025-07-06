let { manifestSync } = module.require("../getters");

function dependenciesSync(
    manifests,
    upToDate,
    remoteIndex,
    manifestCache = {},
) {
    let upToDateSet = {};

    for (let name of upToDate) {
        upToDateSet[name] = true;
    }

    for (let manifest of manifests) {
        if (upToDateSet[manifest.name]) {
            continue;
        }

        if (manifestCache[manifest.name] !== undefined) {
            continue;
        }

        manifestCache[manifest.name] = manifest;

        for (let dep in manifest.dependencies) {
            if (manifestCache[dep] !== undefined) {
                continue;
            }

            manifestCache = dependenciesSync(
                [manifestSync(dep, remoteIndex)],
                upToDate,
                remoteIndex,
                manifestCache,
            );
        }
    }

    return manifestCache;
}

function dependencies(manifest, upToDate, remoteIndex, manifestCache = {}) {
    return Promise(() =>
        dependenciesSync(manifest, upToDate, remoteIndex, manifestCache),
    );
}

module.exports = {
    dependencies,
    dependenciesSync,
};
