function orderSync(manifests, log) {
    for (let key of Object.keys(manifests)) {
        for (let dep of Object.keys(manifests[key].dependencies ?? {})) {
            delete manifests[key].dependencies[dep];
        }
    }

    let order = [];

    while (Object.keys(manifests).length != 0) {
        let passLoaded = [];

        for (let key of Object.keys(manifests)) {
            if (Object.keys(manifests[key].dependencies).length == 0) {
                passLoaded.push(key);
                order.push(key);
                delete manifests[key];
            }
        }

        if (passLoaded.length == 0) {
            if (log)
                console.warn(
                    `There is a dependency cycle, the following modules will not be in the correct order ${Object.keys(manifests)}`,
                );
            order = order.concat(Object.keys(manifests));
            break;
        }
    }

    return order;
}

module.exports = {
    orderSync,
};
