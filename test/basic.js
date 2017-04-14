'use strict'

require('should')
const _load = require('./_load.js')

describe('Config (Basic)', function () {
  var config

  before(function () {
    config = _load('basic')
  })

  it('should have top variables', function () {
    config.var1.should.equal('val1')
    config.var2.should.equal('val2')
  })

  it('should have obj variables', function () {
    config.obj1.var1.should.equal('objval1')
    config.obj1.var2.should.equal('objval2')
  })

  it('should have obj variables', function () {
    config.list1[0].should.equal('listval1')
    config.list1[1].should.equal('listval2')
  })
})
