let fs = require("fs");

function findPackageSync(path) {
    if (fs.existsSync(`${path}/package.json`)) {
        return path;
    }

    for (let dirItem of fs.readdirSync(path)) {
        let res = findPackageSync(`${path}/${dirItem}`);

        if (res) return res;
    }
}

module.exports = {
    findPackageSync,
};
