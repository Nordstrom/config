'use strict'

require('should')
const path = require('path')

describe('Config env from load', function () {
  let config, env

  before(function () {
    env = 'loadenv'
    config = require('../').loadFromFile(path.join(__dirname, 'configs/custom', 'env.yml'), env)
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
})
