let fs = require('fs');

function getLocalManifestsSync() {
    let packages = fs.readdirSync("modules");
    
    let out = {};

    for(let package of packages) {
        out[package] = require(`/modules/${package}/package.json`);
    }

    return out;
}

function getLocalManifests() {
    return Promise(getLocalManifestsSync);
}

module.exports = {
    getLocalManifests,
    getLocalManifestsSync
};