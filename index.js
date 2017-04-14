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
        if (!/ENOENT:\s+no such file or directory/.test(e)) {
            console.log('Error Loading config.yml:', e);
            throw e;
        }
        try {
            return yaml.load(fs.readFileSync('../config.yml', 'utf8'));
        } catch (e) {
            console.log('Error Loading config.yml:', e);
            throw e;
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
        branch = branch.replace(/^#?\s?On branch ((\w|-|_|\/|.)+)/, '$1');

        if (config.branchRegex) {
            branch = branch.replace(new RegExp(_.trim(config.branchRegex)), '$1');
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

function substitute(p) {
    var success = false;
    var replaced = p.replace(/\$\{([\w\.\-]+)}/g, function (match, term) {
        if (!success) {
            success = _.has(config, term);
        }
        return _.get(config, term) || match;
    });
    return {success : success, replace : replaced};
}

function transform(obj) {
    var changed = false;
    var resultant =_.mapValues(obj, function (p) {
        if (_.isPlainObject(p)) {
            var transformed = transform(p);
            if(!changed && transformed.changed){
                changed = true;
            }
            return transformed.result;
        }
        if (_.isString(p)) {
            var subbed = substitute(p);
            if(!changed && subbed.success){
                changed = true;
            }
            return subbed.replace;
        }
        if (_.isArray(p)) {
            for (var i = 0; i < p.length; i++) {
                if (_.isString(p[i])) {
                    p[i] = substitute(p[i]).replace;
                }
            }
        }
        return p;
    });
    return {changed : changed, result : resultant};
}

function log() {
    console.log('CONFIG:', envId || '-', environmentType || '-');
}

function requireSettings(settings) {
    var erredSettings = [];
    settings = _.isString(settings) ? [settings] : settings;
    _.forEach(settings, function (setting) {
        if (!_.has(config, setting)) {
            erredSettings.push(setting);
        }
    });

    if (erredSettings.length > 1) {
        throw new Error('The following settings are required in config.yml: ' + erredSettings.join('; '));
    }

    if (erredSettings.length === 1) {
        throw new Error(erredSettings[0] + ' is required in config.yml');
    }
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

var altered = false;
do {
    var temp = transform(config);
    config = temp.result;
    altered = temp.changed;
} while (altered);

module.exports = config;
module.exports.log = log;
module.exports.require = requireSettings;
