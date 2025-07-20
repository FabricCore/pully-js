let fs = require("fs");
let { Runtime } = Packages.ws.siri.jscore.runtime;

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

    for (let entry of Array.from(Runtime.listLoaded())) {
        if (entry[0] == "modules" && entry[1] == name) {
            Runtime.unload(entry);
        }
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
