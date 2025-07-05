let command = require("command");

let { buildInstallCommand, buildUninstallCommand } =
    module.require("./commands");

command.register({
    name: "pully",

    subcommands: {
        install: buildInstallCommand(),
        uninstall: buildUninstallCommand(),
    },
});
