let cache = module.require("../cache");
let pully = module.require("../", "lazy");

function getRemotePackageList() {
    if (cache.remoteIndex != undefined)
        return Object.keys(cache.remoteIndex);
    else return Object.keys(pully.indexSync());
}

function getLocalPackageList() {
    return Object.keys(pully.getLocalManifestsSync());
}

module.exports = {
    getRemotePackageList,
    getLocalPackageList,
};
