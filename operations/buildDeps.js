let fs = require("fs");

// taken from init.js
function buildDepsSync() {
    let registeredModules = {};

    for (let name of fs.readdirSync("modules")) {
        let manifestPath = `modules/${name}/package.json`;

        if (!fs.existsSync(manifestPath)) {
            console.warn(
                `Could not find package.json for ${name}, that module is not loaded.`,
            );
            continue;
        }

        try {
            let manifestJSON = require(`/${manifestPath}`);

            if (name != manifestJSON.name) {
                console.warn(
                    `Name mismatch: package at ${name} has manifest name ${manifestJSON.name}`,
                );
                continue;
            }

            registeredModules[name] = manifestJSON;
        } catch (error) {
            console.warn(
                `Could not read package.json for ${name}, build incomplete. Cause: ${error}`,
            );
            continue;
        }
    }

    module.globals.loadedModules = {};
    module.globals.loadDependencies = {};

    // topological sort
    while (Object.keys(registeredModules).length !== 0) {
        let toBeLoaded = [];

        for (let moduleManifest of Object.values(registeredModules)) {
            if (Object.keys(moduleManifest.dependencies).length === 0) {
                toBeLoaded.push(moduleManifest.name);
            }
        }

        for (let moduleName of toBeLoaded) {
            delete registeredModules[moduleName];
            module.globals.loadedModules[moduleName] = true;

            for (let moduleManifest of Object.values(registeredModules)) {
                if (moduleManifest.dependencies[moduleName] != undefined) {
                    delete moduleManifest.dependencies[moduleName];
                    module.globals.loadDependencies[moduleManifest.name] ??= [];

                    if (module.globals.loadDependencies[moduleName]) {
                        Array.prototype.push.apply(
                            module.globals.loadDependencies[
                                moduleManifest.name
                            ],
                            module.globals.loadDependencies[moduleName],
                        );
                    }

                    module.globals.loadDependencies[moduleManifest.name].push(
                        moduleName,
                    );
                }
            }
        }

        // remove duplicates
        for (let moduleName in module.globals.loadDependencies) {
            let addedSet = new Set();

            module.globals.loadDependencies[moduleName] =
                module.globals.loadDependencies[moduleName].filter((dep) => {
                    let has = addedSet.has(dep);
                    addedSet.add(dep);
                    return !has;
                });
        }

        if (toBeLoaded.length === 0) {
            console.error(
                `The following modules are not loaded correctly: ${Object.keys(registeredModules).join(", ")}, either because there is a cycle in dependency, or a dependency module has failed to load`,
            );
            break;
        }
    }
}

module.exports = {
    buildDepsSync,
};
