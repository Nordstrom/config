'use strict'

const path = require('path')
const sh = require('shelljs')
const decache = require('decache')

module.exports = function (name) {
  decache('js-yaml')
  decache('yargs')
  // decache('../')
  delete require.cache[require.resolve('../')]
  sh.cp('-f', path.join(__dirname, 'configs', name + '.yml'), 'config.yml')

  return require('../')
}
