'use strict'

require('should')
const sinon = require('sinon')
const moment = require('moment')
const _env = require('./_env.js')
const _load = require('./_load.js')

describe('Config env from branch', function () {
  var config,
    env,
    clock,
    timestamp

  before(function () {
    clock = sinon.useFakeTimers()
    timestamp = moment().format('YYYYMMDDHHmmss')
    config = _load('env')
    env = _env()
  })

  it('should have env variables at top', function () {
    config.lower.should.equal(env)
    config.upper.should.equal(env.toUpperCase())
    config.token.should.equal('token-' + timestamp)
  })

  it('should have env variables in obj', function () {
    config.obj1.obj2.lower.should.equal(env)
    config.obj1.obj2.upper.should.equal(env.toUpperCase())
    config.obj1.obj2.token.should.equal('token-' + timestamp)
  })

  it('should have env variables in obj', function () {
    config.list1[0].should.equal(env)
    config.list1[1].should.equal(env.toUpperCase())
    config.list1[2].should.equal('token-' + timestamp)
  })

  after(function () {
    clock.restore()
  })
})
