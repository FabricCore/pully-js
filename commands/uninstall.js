let { StringArgumentType } = com.mojang.brigadier.arguments;

let { getLocalPackageList } = require("./suggestions");

let { remove } = module.require("../", "lazy");

function uninstall(ctx, numberOfArguments) {
    let packages = [];

    for (let i = 1; i <= numberOfArguments; i++) {
        packages.push(StringArgumentType.getString(ctx, `package${i}`));
    }

    remove(packages, true).catch((e) =>
        console.error(
            `Something went wrong when removing packages.\nCause: ${e}`,
        ),
    );

    return 0;
}

let maxDepth = 256;

function buildUninstallCommand(currentDepth = 0) {
    if (currentDepth == 0) {
        return {
            execute: (ctx) => uninstall(ctx, 0),
            args: {
                package1: buildUninstallCommand(currentDepth + 1),
            },
        };
    }

    let command = {
        suggests: getLocalPackageList,
        type: StringArgumentType.word(),
        execute: (ctx) => uninstall(ctx, currentDepth),
    };

    if (currentDepth <= maxDepth) {
        command.args = {};
        command.args[`package${currentDepth}`] = buildUninstallCommand(
            currentDepth + 1,
        );
    }

    return command;
}

module.exports = buildUninstallCommand;
