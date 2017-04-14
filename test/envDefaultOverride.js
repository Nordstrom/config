'use strict'

require('should')
const _load = require('./_load.js')

describe('Config env with default override', function () {
  var config,
    env

  before(function () {
    env = 'unknown'
    process.env.ENVIRONMENT_ID = env
    config = _load('env')
  })

  it('should override env variables at top', function () {
    config.setting1.should.equal('dummyVal')
  })

  it('should override env variables in obj', function () {
    config.obj1.obj2.setting1.should.equal('objsettingVal1')
  })

  it('should override env variables in list', function () {
    config.settingList1.should.have.length(2)
    config.settingList1[0].should.equal('one')
  })

  after(function () {
    delete process.env.ENVIRONMENT_ID
  })
})
