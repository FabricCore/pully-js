let command = require("command");

let getters = module.require("./getters");

let { buildInstallCommand, buildUninstallCommand } =
    module.require("./commands");

command.register({
    name: "pully",

    subcommands: {
        install: buildInstallCommand(),
        uninstall: buildUninstallCommand(),
    },
});

getters.index();
