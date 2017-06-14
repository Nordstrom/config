'use strict'

require('should')
const sh = require('shelljs')
const _load = require('./_load.js')
const oldConfig = require('../')

// these run the same tests as substitution, just to verify that this approach doesnt change the functionality.
describe('Config (Basic)', function () {
  let config
  const env = 'substitution'

  before(function () {
    sh.rm('config.yml')
    sh.mkdir('config')
    process.argv.push('--' + env)
    config = _load(env, true)
    console.log(config)
  })

  it('should substitute at 1st level', function () {
    config.sub.foo.should.equal('fooval - barfooval')
    config.sub.bar.foo.should.equal('barfooval')
    config.sub.bar.nested.should.equal('nestedfoobarval')
  })

  it('should substitute at 2nd level', function () {
    config.sub2.foo.should.equal('fooval - barfooval')
    config.sub2.bar.foo.should.equal('barfooval')
    config.sub2.bar.nested.should.equal('nestedfoobarval')
  })

  it('should substitute at 3rd level', function () {
    config.sub3.foo.should.equal('fooval - barfooval')
    config.sub3.bar.foo.should.equal('barfooval')
    config.sub3.bar.nested.should.equal('nestedfoobarval')
  })

  it('should substitute beyond 3rd level', function () {
    config.sub4.foo.should.equal('fooval - barfooval')
    config.sub4.bar.foo.should.equal('barfooval')
  })

  it('should not endlessly attempt to parse a nonexistant value', function () {
    config.sub5.should.equal('${nonexistant.value}')  // eslint-disable-line
  })

  after(function () {
    sh.rm('-rf', 'config')
    sh.head(oldConfig + ' > config.yml')
  })
})
