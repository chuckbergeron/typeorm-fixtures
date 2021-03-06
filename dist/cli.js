#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const path = require("path");
const cliProgress = require("cli-progress");
const commander = require("commander");
const resolveFrom = require("resolve-from");
const yargsParser = require("yargs-parser");
const chalk_1 = require("chalk");
const Loader_1 = require("./Loader");
const util_1 = require("./util");
const Resolver_1 = require("./Resolver");
const typeorm_1 = require("typeorm");
const Builder_1 = require("./Builder");
const Parser_1 = require("./Parser");
commander
    .version(require('../package.json').version, '-v, --version')
    .usage('[options] <path> Fixtures folder/file path')
    .arguments('<path> [otherPaths...]')
    .action((fixturesPath, otherPaths, options) => {
    options.paths = [fixturesPath, ...otherPaths];
})
    .option('--require <package>', 'A list of additional modules. e.g. ts-node/register')
    .option('-c, --config <path>', 'TypeORM config path', 'ormconfig.yml')
    .option('-cn, --connection [value]', 'TypeORM connection name', 'default')
    .option('-s --sync', 'Database schema sync')
    .option('-d --debug', 'Enable debug')
    .option('--no-color', 'Disable color');
commander.parse(process.argv);
const argv = yargsParser(process.argv.slice(2));
if (argv.require) {
    const requires = Array.isArray(argv) ? argv : [argv];
    for (const req of requires) {
        require(resolveFrom.silent(process.cwd(), commander.require) || commander.require);
    }
}
if (!commander.paths) {
    console.error('Path to fixtureConfigs folder is not passed.\n');
    commander.outputHelp();
    process.exit(1);
}
const debug = (message) => {
    if (commander.debug) {
        console.log(chalk_1.default.grey(message)); // tslint:disable-line
    }
};
const error = (message) => {
    console.log(chalk_1.default.red(message)); // tslint:disable-line
};
// const typeOrmConfigPath = path.resolve(commander.config);
// if (!fs.existsSync(typeOrmConfigPath)) {
//     throw new Error(`TypeOrm config ${typeOrmConfigPath} not found`);
// }
debug('Connection to database...');
util_1.createConnection(commander.connection)
    .then((connection) => __awaiter(this, void 0, void 0, function* () {
    debug('Database is connected');
    if (commander.sync) {
        debug('Synchronize database schema');
        yield connection.synchronize(true);
    }
    debug('Loading fixtureConfigs');
    const loader = new Loader_1.Loader();
    commander.paths.forEach((fixturePath) => {
        const p = path.resolve(fixturePath);
        loader.load(path.resolve(fixturePath));
    });
    debug('Resolving fixtureConfigs');
    const resolver = new Resolver_1.Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder_1.Builder(connection, new Parser_1.Parser());
    const bar = new cliProgress.Bar({
        format: `${chalk_1.default.yellow('Progress')}  ${chalk_1.default.green('[{bar}]')} ${chalk_1.default.yellow('{percentage}% | ETA: {eta}s | {value}/{total} {name}')} `,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        fps: 5,
        stream: process.stdout,
        barsize: 50,
    });
    bar.start(fixtures.length, 0, { name: '' });
    for (const fixture of util_1.fixturesIterator(fixtures)) {
        const entity = yield builder.build(fixture);
        debug(``);
        debug(`Processing: ${entity.constructor.name} '${fixture.name}' with entity name '${fixture.entity}'`);
        try {
            bar.increment(1, { name: fixture.name });
            yield typeorm_1.getRepository(entity.constructor.name).save(entity);
        }
        catch (e) {
            bar.stop();
            throw e;
        }
    }
    bar.update(fixtures.length, { name: '' });
    bar.stop();
    debug('\nDatabase disconnect');
    yield connection.close();
}))
    .catch((e) => __awaiter(this, void 0, void 0, function* () {
    error('Fail fixture loading: ' + e.message);
    yield typeorm_1.getConnection().close();
    console.log(e); // tslint:disable-line
    process.exit(1);
}));
//# sourceMappingURL=cli.js.map