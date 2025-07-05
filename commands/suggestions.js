let cache = module.require("../cache");
let { repo } = require("../config.json");
let pully = module.require("../", "lazy");

function getRemotePackageList() {
    if (cache.remoteIndex != undefined && cache.remoteIndex[repo] != undefined)
        return Object.keys(cache.remoteIndex[repo]);
    else return Object.keys(pully.indexSync());
}

module.exports = {
    getRemotePackageList,
};
