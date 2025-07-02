let { StringArgumentType } = com.mojang.brigadier.arguments;
let { pull } = module.require("../", "lazy");

function install(ctx, numberOfArguments) {
    let packages = [];

    for (let i = 1; i <= numberOfArguments; i++) {
        packages.push(StringArgumentType.getString(ctx, `package${i}`));
    }

    pull(packages, true).catch((e) =>
        console.error(
            `Something went wrong when pulling packages.\nCause: ${e}`,
        ),
    );

    return 0;
}

let maxDepth = 256;

function buildInstallCommand(currentDepth = 0) {
    if (currentDepth == 0) {
        return {
            args: {
                package1: buildInstallCommand(currentDepth + 1),
            },
        };
    }

    let command = {
        type: StringArgumentType.word(),
        execute: (ctx) => install(ctx, currentDepth),
    };

    if (currentDepth <= maxDepth) {
        command.args = {};
        command.args[`package${currentDepth}`] = buildInstallCommand(
            currentDepth + 1,
        );
    }

    return command;
}

module.exports = buildInstallCommand;
