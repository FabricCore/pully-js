let { getOrphansSync } = module.require("../resolve");
let fs = require("fs");

function removeSync(packages, log) {
    let explicits = require("/storage/pully/explicits.json");

    for (let name of packages) {
        if (explicits[name] == undefined && fs.existsSync(`modules/${name}`)) {
            console.error(
                `${name} is not installed with pully, please remove it first`,
            );
            console.error("No packages removed.");
            return;
        }

        explicits[name] = false;
    }

    let orphans = getOrphansSync(explicits);

    for (let name of packages) {
        if ((orphans[name] ?? []).length != 0) {
            console.error(
                `${name} is required by ${orphans[name].join(", ")}.`,
            );
            console.error("No packages removed.");
            return;
        }
    }

    let removeCount = 0;

    for (let [name, deps] of Object.entries(orphans)) {
        if (deps.length != 0) continue;

        if (explicits[name] == undefined && fs.existsSync(`modules/${name}`)) {
            console.error(
                `${name} is not installed with pully, please remove it first`,
            );
            console.error("No packages removed.");
            return;
        } else if (fs.existsSync(`modules/${name}/.git`)) {
            console.error(
                `${name} is a Git repository, please remove it first.`,
            );
            console.error("No packages removed.");
            return;
        }

        if (log) console.info(`Removing ${name}`);
        removeCount++;
        fs.unlinkSync(`modules/${name}`);
        delete explicits[name];
    }

    if (log) console.info(`Removed ${removeCount} packages.`);

    if (removeCount != 0) {
        fs.writeFileSync(
            "storage/pully/explicits.json",
            JSON.stringify(explicits, null, 2),
        );
    }
}

function remove(packages, log) {
    return Promise(() => removeSync(packages, log));
}

module.exports = {
    remove,
    removeSync,
};
