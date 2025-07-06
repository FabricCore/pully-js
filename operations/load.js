let fs = require("fs");

function loadSync(name) {
    if (
        fs.existsSync(`modules/${name}/init.js`) ||
        fs.existsSync(`modules/${name}/init/index.js`)
    ) {
        module.require(`/modules/${name}/init`);
    }
}

function unloadSync(name) {
    if (
        fs.existsSync(`modules/${name}/stop.js`) ||
        fs.existsSync(`modules/${name}/stop/index.js`)
    ) {
        module.require(`/modules/${name}/stop`);
    }
}

function load(name) {
    return Promise(() => loadSync(name));
}

function unload(name) {
    return Promise(() => unloadSync(name));
}

module.exports = {
    load,
    loadSync,
    unload,
    unloadSync,
};
