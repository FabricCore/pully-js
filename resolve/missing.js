let getters = module.require("../getters");

function missingSync(localManifests, index) {
    let missed = {};

    for (let manifest of Object.values(localManifests)) {
        for (let dep of Object.keys(manifest.dependencies)) {
            if (localManifests[dep] == undefined) missed[dep] = true;
        }
    }

    let unresolved = {};

    for (let name of Object.keys(missed)) {
        if (index[name] == undefined) {
            unresolved[name] = true;
        }
    }

    if (Object.keys(unresolved).length != 0) {
        return Object.keys(unresolved);
    }

    for (let name of Object.keys(missed)) {
        missed[name] = getters.manifestSync(name, index, index[name].version);
    }

    return missed;
}

function missing(localManifests, index) {
    return Promise(() => missingSync(localManifests, index));
}

module.exports = {
    missingSync,
    missing,
};
