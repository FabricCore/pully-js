let { fetchSync } = require("fetch")
let { repo } = require("../config.json");

function versionSync(package) {
    let res = fetchSync(`${repo}/packages/${package}/versions.json`);

    if(!res.ok()) {
        throw new Error(`Returned with status code ${res.statusText()} when fetching ${res.url()}`);
    }

    return res.json();
}

function version(package) {
    return Promise(() => versionSync(package, version));
}

module.exports = {
    versionSync,
    version
}