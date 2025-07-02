let { fetchSync } = require("fetch");
let { repo } = require("../config.json");

function manifestSync(package, version) {
    let res;

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

function manifest(package, version) {
    return Promise(() => manifestSync(package, version));
}

module.exports = {
    manifest,
    manifestSync,
};
