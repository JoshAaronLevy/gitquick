"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const runner_1 = require("../lib/runner");
const program = new commander_1.default.Command();
program
    .description(`Example: gitquick "I fixed a bug"`)
    .option('[message]')
    .option('-c, --commit')
    .version('2.11.16', '-v, --version')
    .action(async (message, command) => {
    let commit = command.commit;
    if (!commit) {
        commit = false;
    }
    else {
        commit = true;
    }
    await (0, runner_1.runner)(message, commit);
});
program.parse(process.argv);
