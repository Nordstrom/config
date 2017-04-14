'use strict'

require('should')
const _load = require('./_load.js')

describe('Config with substitution', function () {
  var config

  before(function () {
    config = _load('substitution')
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
})
