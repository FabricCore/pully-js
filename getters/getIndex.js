let { fetchSync } = require("fetch");
let cache = module.require("../cache");
let { getConfigSync } = module.require("../local");

function indexSync() {
    let { repos } = getConfigSync();

    let remoteIndex = {};

    for (let [reponame, url] of Object.entries(repos)) {
        let res = fetchSync(`${url}/index.json`);
        if (!res.ok()) {
            throw new Error(
                `Returned with status code ${res.status()} ${res.statusText()} when fetching repository ${reponame} at ${res.url()}`,
            );
        }

        let json = res.json();

        for (let name of Object.keys(json)) {
            if (remoteIndex[name]) {
                console.warn(
                    `Name clash: (${remoteIndex[name].source} <-> ${reponame}), please notify maintainers immediately.`,
                );
            } else {
                remoteIndex[name] = json[name];
                remoteIndex[name].source = reponame;
            }
        }
    }
    cache.remoteIndex ??= {};
    cache.remoteIndex = remoteIndex;

    return remoteIndex;
}

function index() {
    return Promise(indexSync);
}

module.exports = {
    index,
    indexSync,
};
