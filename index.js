
    // manifest, // manifest(package, version?)
    // versions, // versions(package)
    // index,    // index()

module.exports = {};

Object.assign(module.exports, module.require("./getters"));
Object.assign(module.exports, module.require("./local"));
Object.assign(module.exports, module.require("./resolve"));
Object.assign(module.exports, module.require("./operations"));