'use strict';

var _ = require('lodash'),
    flow = require('lodash/fp/flow'),
    head = require('lodash/fp/head'),
    pick = require('lodash/fp/pick'),
    keys = require('lodash/fp/keys'),
    fs = require('fs'),
    sh = require('shelljs'),
    yaml = require('js-yaml'),
    moment = require('moment'),
    args = require('yargs').argv,
    timestamp = moment().format('YYYYMMDDHHmmss'),
    config = loadConfig(),
    environments = config.environments || {},
    envId = getEnvId(),
    ENVID = envId ? envId.toUpperCase() : undefined,
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
        var branch = sh.exec('git status', { silent: true }).stdout;

        if (!branch || _.includes(branch, 'fatal:')) {
            return;
        }

        branch = branch.split('\n')[0];
        console.log(branch);
        branch = branch.replace(/^#?\s?On branch ([\w-_/.]+)/, '$1');
        console.log(branch);

        if (config.branchRegex) {
            branch = branch.replace(new RegExp(_.trim(config.branchRegex)), '$1');
            console.log(branch);
        }

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
        flow(
            pick((config.environments || {}).static),
            keys,
            head
        )(args) ||
        process.env.ENVIRONMENT_ID ||
        getEnvIdFromBranch();
}

config = _.merge(
    {},
    config || {},
    config[environmentType] || {},
    {
        envId: envId,
        ENVID: ENVID,
        timestamp: timestamp
    });

function substitute(p) {
    return p.replace(/\$\{([\w\.\-]+)}/g, function (match, term) {
        return _.get(config, term) || match;
    });
}

function transform(obj) {
    return _.mapValues(obj, function (p) {
        if (_.isPlainObject(p)) {
            return transform(p);
        }
        if (_.isString(p)) {
            return substitute(p);
        }
        if (_.isArray(p)) {
            for (var i = 0; i < p.length; i++) {
                if (_.isString(p[i])) {
                    p[i] = substitute(p[i]);
                }
            }
        }
        return p;
    });
}

function log() {
    console.log('CONFIG:', envId || '-', environmentType || '-');
}

module.exports = transform(transform(transform(config)));  // transform 3 times to allow 3 levels of vars
module.log = log;
