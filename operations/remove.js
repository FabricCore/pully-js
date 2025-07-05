let { getOrphansSync } = module.require("../resolve");
let fs = require("fs");

function removeSync(packages, log) {
    let orphans = getOrphansSync();

    for (let name of packages) {
        if (orphans[name] == undefined) continue;
        let remainedDependent = orphans[name].filter(
            (dep) => !packages.includes(dep),
        );

        if (remainedDependent.length != 0) {
            console.error(
                `${name} is required by ${remainedDependent.join(", ")}.`,
            );
            console.error("No packages removed.");
            return;
        }
    }

    let explicits = require("/storage/pully/explicits.json");
    let removeCount = 0;

    for (let [name, deps] of Object.entries(orphans)) {
        if (deps.length != 0) continue;

        if (log) console.info(`Removing ${name}`);
        fs.unlinkSync(`modules/${name}`);
        removeCount++;
        delete explicits[name];
    }

    if (removeCount != 0) {
        fs.writeFileSync(
            "storage/pully/explicits.json",
            JSON.stringify(explicits, null, 2),
        );
    }

    if (log) console.info(`Removed ${removeCount} packages.`);
}

function remove(packages, log) {
    return Promise(() => removeSync(packages, log));
}

module.exports = {
    remove,
    removeSync,
};
