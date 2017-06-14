'use strict'

const path = require('path')
const sh = require('shelljs')
const decache = require('decache')

module.exports = function (name, folder) {
  decache('js-yaml')
  decache('yargs')
  // decache('../')
  delete require.cache[require.resolve('../')]
  if (folder) {
    sh.cp('-f', path.join(__dirname, 'configs', 'basic.yml'), 'config/defaults.config.yml')
  }
  sh.cp('-f', path.join(__dirname, 'configs', name + '.yml'), folder ? 'config/' + name + '.config.yml' : 'config.yml')

  return require('../')
}
