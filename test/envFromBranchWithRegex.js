'use strict'

require('should')
const sinon = require('sinon')
const _env = require('./_env.js')
const _load = require('./_load.js')

describe('Config env from branch with regex', function () {
  var config, env, clock

  before(function () {
    clock = sinon.useFakeTimers()
    config = _load('env-w-regex')
    env = _env(true)
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
    clock.restore()
  })
})
