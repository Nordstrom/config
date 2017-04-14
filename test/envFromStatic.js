'use strict'

require('should')
const _load = require('./_load.js')

describe('Config env from static', function () {
  var config, env

  before(function () {
    env = 'dummy'
    process.argv.push('--dummy')
    config = _load('env')
  })

  it('should have env variables at top', function () {
    config.lower.should.equal(env)
    config.upper.should.equal(env.toUpperCase())
  })

  it('should have env variables in obj', function () {
    config.obj1.obj2.lower.should.equal(env)
    config.obj1.obj2.upper.should.equal(env.toUpperCase())
  })

  it('should have env variables in obj', function () {
    config.list1[0].should.equal(env)
    config.list1[1].should.equal(env.toUpperCase())
  })

  after(function () {
    process.argv.pop()
  })
})
