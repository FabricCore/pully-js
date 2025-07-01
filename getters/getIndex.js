let { fetchSync } = require("fetch");
let { repo } = require("../config.json");

function indexSync() {
    let res = fetchSync(`${repo}/index.json`);
    if(!res.ok()) {
        throw new Error(`Returned with status code ${res.statusText()} when fetching ${res.url()}`);
    }

    return res.json();
}

function index() {
    return Promise(indexSync);
}

module.exports = {
    index,
    indexSync
};