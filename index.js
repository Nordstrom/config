'use strict'

const _ = require('lodash')
const flow = require('lodash/fp/flow')
const head = require('lodash/fp/head')
const pick = require('lodash/fp/pick')
const keys = require('lodash/fp/keys')
const fs = require('fs')
const sh = require('shelljs')
const yaml = require('js-yaml')
const moment = require('moment')
const args = require('yargs').argv
const timestamp = moment().format('YYYYMMDDHHmmss')

let config = loadConfig()
let environments = config.environments || {}
let envId = getEnvId()
let ENVID = envId ? envId.toUpperCase() : undefined
let environmentType = (_.includes(environments.static, envId) ? envId : undefined) || environments.default

function loadConfig () {
  try {
    return yaml.load(fs.readFileSync('config.yml', 'utf8'))
  } catch (e) {
    if (!/ENOENT:\s+no such file or directory/.test(e)) {
      console.log('Error Loading config.yml:', e)
      throw e
    }
    try {
      return yaml.load(fs.readFileSync('../config.yml', 'utf8'))
    } catch (e) {
      console.log('Error Loading config.yml:', e)
      throw e
    }
  }
}

function getEnvIdFromBranch () {
  try {
    var branch = sh.exec('git status', { silent: true }).stdout

    if (!branch || _.includes(branch, 'fatal:')) {
      return
    }

    branch = branch.split('\n')[0]
    branch = branch.replace(/^#?\s?On branch ((\w|-|_|\/|.)+)/, '$1')

    if (config.branchRegex) {
      branch = branch.replace(new RegExp(_.trim(config.branchRegex)), '$1')
    }

    return _.trimEnd(_.truncate(branch, {
      length: 13,
      omission: ''
    }), '-')
  } catch (e) {
    console.log('ERR: ', e)
        // Do nothing
  }
}

function getEnvId () {
  return args.env ||
        flow(
            pick((config.environments || {}).static),
            keys,
            head
        )(args) ||
        process.env.ENVIRONMENT_ID ||
        getEnvIdFromBranch()
}

function substitute (p) {
  let success = false
  let replaced = p.replace(/\$\{([\w.-]+)}/g, function (match, term) {
    if (!success) {
      success = _.has(config, term)
    }
    return _.get(config, term) || match
  })
  return {success: success, replace: replaced}
}

function transform (obj) {
  var changed = false
  var resultant = _.mapValues(obj, function (p) {
    if (_.isPlainObject(p)) {
      var transformed = transform(p)
      if (!changed && transformed.changed) {
        changed = true
      }
      return transformed.result
    }
    if (_.isString(p)) {
      var subbed = substitute(p)
      if (!changed && subbed.success) {
        changed = true
      }
      return subbed.replace
    }
    if (_.isArray(p)) {
      for (var i = 0; i < p.length; i++) {
        if (_.isString(p[i])) {
          p[i] = substitute(p[i]).replace
        }
      }
    }
    return p
  })
  return {changed: changed, result: resultant}
}

function log () {
  console.log('CONFIG:', envId || '-', environmentType || '-')
}

function requireSettings (settings) {
  var erredSettings = []
  settings = _.isString(settings) ? [settings] : settings
  _.forEach(settings, function (setting) {
    if (!_.has(config, setting)) {
      erredSettings.push(setting)
    }
  })

  if (erredSettings.length > 1) {
    throw new Error('The following settings are required in config.yml: ' + erredSettings.join('; '))
  }

  if (erredSettings.length === 1) {
    throw new Error(erredSettings[0] + ' is required in config.yml')
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
  })

let altered = false
do {
  let temp = transform(config)
  config = temp.result
  altered = temp.changed
} while (altered)

module.exports = config
module.exports.log = log
module.exports.require = requireSettings
