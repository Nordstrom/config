'use strict'

const _ = require('lodash')
const sh = require('shelljs')

module.exports = function (regex) {
  var env = sh.exec('git status', { silent: true }).stdout
  env = env.split('\n')[0]
  env = env.replace(/^#?\s?On branch ([\w-_/.]+)/, '$1')
  env = regex ? env.replace(/\w(\w+)\w/, '$1') : env

  env = env ? _.truncate(env, {
    length: 13,
    omission: ''
  }) : undefined

  var hash = sh.exec('git rev-parse HEAD').stdout
  hash = hash.substring(0, 5)

  return (env.includes(' ')) ? hash : env
}
