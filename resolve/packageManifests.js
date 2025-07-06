let { manifestSync } = module.require("../getters", "lazy");

function packageManifestsSync(packages, index) {
    let out = {};

    for (let name of packages) {
        out[name] = manifestSync(name, index, index[name].version);
    }

    return out;
}

module.exports = {
    packageManifestsSync,
};
