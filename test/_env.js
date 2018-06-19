'use strict'

const _ = require('lodash')
const sh = require('shelljs')

module.exports = function (regex) {
  var env = sh.exec('git name-rev HEAD --name-only').stdout

  env = env ? _.truncate(env, {
    length: 13,
    omission: ''
  }) : undefined

  return env
}
