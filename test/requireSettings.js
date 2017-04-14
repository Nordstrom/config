'use strict'

require('should')
const _load = require('./_load.js')

describe('Config require', function () {
  var config

  before(function () {
    config = _load('basic')
  })

  it('should flag single variables', function () {
    (function () { config.require('var3') }).should.throw('var3 is required in config.yml');
    (function () { config.require('var2') }).should.not.throw(Error);
    (function () { config.require('obj1.var3') }).should.throw('obj1.var3 is required in config.yml');
    (function () { config.require('obj2.var5') }).should.throw('obj2.var5 is required in config.yml')
  })

  it('should flag variable list', function () {
    (function () {
      config.require([
        'var3',
        'var2',
        'obj1.var3',
        'obj1.var1'])
    }).should.throw('The following settings are required in config.yml: var3; obj1.var3')
  })
})
