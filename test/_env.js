'use strict'

const _ = require('lodash')
const sh = require('shelljs')

module.exports = function (regex) {
  var env = sh.exec('git name-rev HEAD --name-only').stdout

  env = _.last(_.split(env, '/'))

  return env ? _.truncate(env, {
    length: 13,
    omission: ''
  }).replace(/(\r\n|\n|\r)/gm, '') : undefined
}
