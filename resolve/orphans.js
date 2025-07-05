let { getLocalManifestsSync } = module.require("../local");
let fs = require("fs");

function getOrphansSync() {
    let manifests = getLocalManifestsSync();

    let explicits = require("/storage/pully/explicits.json");
    let queue = [];

    let isOrphan = {};
    for (let name in manifests) {
        if (
            explicits[name] == undefined ||
            fs.existsSync(`modules/${name}/.git`)
        ) {
            // user pakcage
            queue.push(name);
        }
        isOrphan[name] = true;
    }

    for (let [name, isExplicit] of Object.entries(explicits)) {
        if (isExplicit && !queue.includes(name)) queue.push(name);
    }

    let requiredBys = {};

    while (queue.length != 0) {
        let name = queue.shift();
        if (!isOrphan[name]) continue;

        isOrphan[name] = false;

        let manifest = manifests[name];
        for (let dep in manifest.dependencies) {
            requiredBys[dep] ??= [];
            requiredBys[dep].push(name);
            if (!queue.includes(dep)) queue.push(dep);
        }
    }

    for (let [name, is] of Object.entries(isOrphan)) {
        if (is) requiredBys[name] = [];
    }

    return requiredBys;
}

module.exports = {
    getOrphansSync,
};
