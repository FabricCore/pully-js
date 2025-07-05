let { manifestSync } = module.require("../getters", "lazy");

function packageManifestsSync(packages, index) {
    console.log(packages);
    let out = {};

    for (let name of packages) {
        out[name] = manifestSync(name, index[name].version);
    }

    console.log(JSON.stringify(out));
    return out;
}

module.exports = {
    packageManifestsSync,
};
