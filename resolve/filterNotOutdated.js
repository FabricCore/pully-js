function filterNotOutdated(packages, outdated) {
    let outdated = new Set(outdated);

    return packages.filter(s => outdated.has(s));
}

module.exports = filterNotOutdated;