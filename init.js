let command = require("command");

let { buildInstallCommand } = module.require("./commands");

command.register({
    name: "pully",

    subcommands: {
        install: buildInstallCommand(),
    },
});
