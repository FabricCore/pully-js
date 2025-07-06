let { fetchSync } = require("fetch");
let { getConfigSync } = module.require("../local");

function manifestSync(package, remoteIndex, version) {
    let { repos } = getConfigSync();

    let res;

    let repo = repos[remoteIndex[package].source];

    if (version == undefined) {
        res = fetchSync(`${repo}/packages/${package}/package.json`);
    } else {
        res = fetchSync(`${repo}/packages/${package}/releases/${version}.json`);
    }

    if (!res.ok()) {
        throw new Error(
            `Returned with status code ${res.status()} ${res.statusText()} when fetching ${res.url()}`,
        );
    }

    return res.json();
}

function manifest(package, remoteIndex, version) {
    return Promise(() => manifestSync(package, remoteIndex, version));
}

module.exports = {
    manifest,
    manifestSync,
};
