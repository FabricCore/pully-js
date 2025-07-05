let { fetchSync } = require("fetch");
let { repo } = require("../config.json");

let cache = module.require("../cache");

function indexSync() {
    let res = fetchSync(`${repo}/index.json`);
    if (!res.ok()) {
        throw new Error(
            `Returned with status code ${res.status()} ${res.statusText()} when fetching ${res.url()}`,
        );
    }

    let json = res.json();
    cache.remoteIndex ??= {};
    cache.remoteIndex[repo] = json;

    return json;
}

function index() {
    return Promise(indexSync);
}

module.exports = {
    index,
    indexSync,
};
