'use strict'

/* global require, module */

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
let multiFile = false
let config = loadConfig()
let environments = config.environments || {}
let envId = getEnvId(config)
let ENVID = envId ? envId.toUpperCase() : undefined
let environmentType = (_.includes(environments.static, envId) ? envId : (multiFile ? envId : undefined)) || environments.default
config = swapVariables(config)

function loadConfigFile (file) {
  try {
    return yaml.load(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    if (!/ENOENT:\s+no such file or directory/.test(e)) {
      console.log('Error Loading ' + file + ':', e)
      throw e
    }
  }
}

function loadConfig () {
  if (fs.existsSync('config.yml')) {
    return loadConfigFile('config.yml')
  } else {
    let templ = {}
    multiFile = true
    let files = fs.readdirSync('config')
    for (let i = 0; i < files.length; i++) {
      if (files[i].endsWith('.yml')) {
        let keyName = files[i].substring(0, files[i].length - '.yml'.length)
        templ[keyName] = loadConfigFile('config/' + files[i])
      }
    }
    return templ
  }
}

function getEnvIdFromBranch () {
  try {
    let branch = sh.exec('git status', { silent: true }).stdout

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

function getEnvId (obj) {
  return args.env ||
        flow(
            pick(keys(obj)),
            keys,
            head
        )(args) ||
        process.env.ENVIRONMENT_ID ||
        getEnvIdFromBranch()
}

function substitute (file, p) {
  let success = false
  let replaced = p.replace(/\${([\w.-]+)}/g, function (match, term) {
    if (!success) {
      success = _.has(file, term)
    }
    return _.get(file, term) || match
  })
  return {success: success, replace: replaced}
}

function transform (file, obj) {
  let changed = false
  let resultant = _.mapValues(obj, function (p) {
    if (_.isPlainObject(p)) {
      let transformed = transform(file, p)
      if (!changed && transformed.changed) {
        changed = true
      }
      return transformed.result
    }
    if (_.isString(p)) {
      let subbed = substitute(file, p)
      if (!changed && subbed.success) {
        changed = true
      }
      return subbed.replace
    }
    if (_.isArray(p)) {
      for (let i = 0; i < p.length; i++) {
        if (_.isString(p[i])) {
          p[i] = substitute(file, p[i]).replace
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
  let erredSettings = []
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

function swapVariables (configFile) {
  function readAndSwap (obj) {
    let altered = false
    do {
      let temp = transform(obj, obj)
      obj = temp.result
      altered = temp.changed
    } while (altered)
    return obj
  }

  let file = multiFile ? _.mapValues(configFile, readAndSwap) : configFile
  file = _.merge(
    {},
    file || {},
    file[environmentType] || {},
    {
      envId: envId,
      ENVID: ENVID,
      timestamp: timestamp
    })

  file = readAndSwap(file)
  return file
}
module.exports = config
module.exports.log = log
module.exports.require = requireSettings
