'use strict'

const _ = require('lodash')
const sh = require('shelljs')

module.exports = function (regex) {
  var env = sh.exec('git rev-parse --abbrev-ref HEAD').stdout.replace(/\n/g, '')

  env = _.last(_.split(env, '/'))

  return env ? _.truncate(env, {
    length: 13,
    omission: ''
  }).replace(/(\r\n|\n|\r)/gm, '') : undefined
}
