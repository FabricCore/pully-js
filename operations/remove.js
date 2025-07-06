let { getOrphansSync } = module.require("../resolve");
let fs = require("fs");
let pully = module.require("../", "lazy");

function removeSync(packages, log) {
    if (log) console.info("Resolving dependencies...");
    let localManifests = pully.getLocalManifestsSync();

    let explicits;
    if (fs.existsSync("storage/pully/explicits.json")) {
        explicits = require("/storage/pully/explicits.json");
    } else {
        explicits = {};
    }

    for (let name of packages) {
        if (name == "pully") {
            console.error("Pully cannot uninstall itself.");
            console.error(
                "Manual installation of packages can lead to inconsistencies.",
            );
            console.error("No packages removed.");
            return;
        }

        if (explicits[name] == undefined && fs.existsSync(`modules/${name}`)) {
            console.error(
                `${name} is not installed with pully, please remove it first`,
            );
            console.error("No packages removed.");
            return;
        }

        explicits[name] = false;
    }

    let orphans = getOrphansSync(explicits, localManifests);

    for (let name of packages) {
        if ((orphans[name] ?? []).length != 0) {
            console.error(
                `${name} is required by ${orphans[name].join(", ")}.`,
            );
            console.error("No packages removed.");
            return;
        }
    }

    let removedPackages = [];

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
        removedPackages.push(name);
        fs.unlinkSync(`modules/${name}`);
        delete explicits[name];
    }

    let removedManifests = {};
    for (let removed of removedPackages) {
        removedManifests[removed] = localManifests[removed];
    }

    let order = pully.orderSync(removedManifests);

    for (let toUnload of order.reverse()) {
        try {
            pully.unloadSync(toUnload);
        } catch (e) {
            console.warn(
                `An error occured when running stop for ${toUnload}. Cause: ${e}`,
            );
        }
    }

    if (log) {
        if (removedPackages.length == 0) {
            console.warn("No packages removed.");
        } else {
            console.info(
                `Removed ${removedPackages.length} package${removedPackages.length > 1 ? "s" : ""}.`,
            );
        }
    }

    if (removedPackages.length != 0) {
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
