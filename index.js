'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    sh = require('shelljs'),
    yaml = require('js-yaml'),
    moment = require('moment'),
    args = require('yargs').argv,
    timestamp = moment().format('YYYYMMHHmmss'),
    config = loadConfig(),
    environments = config.environments || {},
    envId = getEnvId(),
    ENVID = envId ? envId.toUpperCase() : undefined,
    context = getExecutionContext(),
    environmentType = (_.includes(environments.static, envId) ? envId : undefined) || environments.default;

function loadConfig() {
    try {
        return yaml.load(fs.readFileSync('config.yml', 'utf8'));
    } catch (e) {
        try {
            return yaml.load(fs.readFileSync('../config.yml', 'utf8'));
        } catch (e) {
            return {};
        }
    }
}

function getEnvIdFromBranch() {
    try {
        var branch = sh.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout;

        if (!branch || _.includes(branch, 'fatal:')) {
            return;
        }

        branch = branch
            .toString()
            .trim()
            .replace(new RegExp(config.branchPrefix), '')
            .replace(/\w+\//, '');

        return _.trimEnd(_.truncate(branch, {
            length: 13,
            omission: ''
        }), '-');
    }
    catch (e) {
        console.log('ERR: ', e);
        // Do nothing
    }
}

function getEnvId() {
    return args.env ||
        _.head(_.pick(args, (config.environments || {}).static)) ||
        process.env.ENVIRONMENT_ID ||
        getEnvIdFromBranch();
}

function getExecutionContext() {
    return (global.EXECUTION_CONTEXT || process.env.EXECUTION_CONTEXT || '').toLowerCase() ||
        _.head(_.pick(args, config.executionContexts));
}

config = _.merge(
    {},
    config || {},
    config[environmentType] || {},
    config[context] || {},
    {
        envId: envId,
        ENVID: ENVID,
        timestamp: timestamp
    });

function transform(obj) {
    return _.mapValues(obj, function (p) {
        if (_.isPlainObject(p)) {
            return transform(p);
        }
        if (_.isString(p)) {
            return p.replace(/\$\{([\w\.\-]+)\}/g, function (match, term) {
                return _.get(config, term) || match;
            });
        }
        return p;
    });
}

function log() {
    console.log('CONFIG:', envId || '-', context || '-', environmentType || '-');
}

module.exports = transform(transform(transform(config)));  // transform 3 times to allow 3 levels of vars
module.getExecutionContext = getExecutionContext;
module.log = log;
