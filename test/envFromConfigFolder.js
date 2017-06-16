'use strict'

require('should')
const sh = require('shelljs')
const decache = require('decache')

describe('Config (from folder)', function () {
  let config
  before(function () {
    sh.mkdir('config')
    sh.mv('config.yml', 'config.yml.test')
  })
  describe('with multiple files', function () {
    before(function () {
      sh.cp('test/configs/substitution.yml', 'config/substitution.yml')
      sh.cp('test/configs/basic.yml', 'config/basic.yml')
    })

    describe('with no arguments', function () {
      before(function () {
        decache('js-yaml')
        decache('yargs')
        delete require.cache[require.resolve('../')]
        config = require('../')
      })

      it('should house both files', function () {
        config.basic.var1.should.equal('val1')
        config.substitution.foo.should.equal('fooval')
      })

      it('should be able to use cross file references', function () {
        config.substitution.sub6.should.equal(config.basic.var1)
      })

      it('should still allow regular variable substitution', function () {
        config.substitution.sub.bar.foo.should.equal(config.substitution.bar.foo)
      })
    })

    describe('with --env arguments', function () {
      before(function () {
        decache('js-yaml')
        decache('yargs')
        process.argv.push('--env')
        process.argv.push('substitution')
        delete require.cache[require.resolve('../')]
        config = require('../')
      })

      it('should house both files', function () {
        config.basic.var1.should.equal('val1')
        config.substitution.foo.should.equal('fooval')
      })

      it('env should be root element', function () {
        config.foo.should.equal('fooval')
      })

      after(function () {
        process.argv.pop()
        process.argv.pop()
      })
    })

    describe('with --[env] arguments', function () {
      before(function () {
        decache('js-yaml')
        decache('yargs')
        process.argv.push('--substitution')
        delete require.cache[require.resolve('../')]
        config = require('../')
      })

      it('should house both files', function () {
        config.basic.var1.should.equal('val1')
        config.substitution.foo.should.equal('fooval')
      })

      it('env should be root element', function () {
        config.foo.should.equal('fooval')
      })

      after(function () {
        process.argv.pop()
      })
    })
  })

  after(function () {
    sh.exec('rm -rf config')
    sh.mv('config.yml.test', 'config.yml')
  })
})
