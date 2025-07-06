let { getLocalManifestsSync } = module.require("../local");
let fs = require("fs");

function getOrphansSync(explicits, manifests) {
    let queue = [];

    let isOrphan = {};
    for (let name in manifests) {
        if (
            explicits[name] == undefined ||
            fs.existsSync(`modules/${name}/.git`)
        ) {
            // user pakcage
            queue.push([name, [name]]);
        }
        isOrphan[name] = true;
    }

    for (let [name, isExplicit] of Object.entries(explicits)) {
        if (isExplicit) queue.push([name, [name]]);
    }

    let requiredBys = {};

    while (queue.length != 0) {
        let [name, reqStack] = queue.shift();
        if (!isOrphan[name]) continue;

        isOrphan[name] = false;

        let manifest = manifests[name];
        for (let dep in manifest.dependencies) {
            requiredBys[dep] ??= [];
            requiredBys[dep].push(reqStack[0]);
            if (!queue.includes(dep))
                queue.push([dep, reqStack.concat([name])]);
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
