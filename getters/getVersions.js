let { fetchSync } = require("fetch")
let { getConfigSync } = module.require("../local");

function versionSync(package, remoteIndex) {
    let { repos } = getConfigSync();
    let repo = repos[remoteIndex[package].source];
    
    let res = fetchSync(`${repo}/packages/${package}/versions.json`);

    if(!res.ok()) {
        throw new Error(`Returned with status code ${res.status()} ${res.statusText()} when fetching ${res.url()}`);
    }

    return res.json();
}

function version(package, remoteIndex) {
    return Promise(() => versionSync(package, remoteIndex));
}

module.exports = {
    versionSync,
    version
}
