let fs = require("fs");

function getConfigSync() {
    if (fs.existsSync("storage/pully/config.json")) {
        return require("/storage/pully/config.json");
    } else {
        let empty = {
            repos: {
                core: "https://raw.githubusercontent.com/FabricCore/jscore-openrepo/refs/heads/master",
            },
        };

        fs.mkdirSync("storage/pully");
        fs.writeFileSync(
            "storage/pully/config.json",
            JSON.stringify(empty, null, 2),
        );
        return empty;
    }
}

function getConfig() {
    return Promise(getConfigSync);
}

module.exports = {
    getConfigSync,
    getConfig,
};
