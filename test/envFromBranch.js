'use strict';

var _ = require('lodash'),
    should = require('should'),
    sh = require('shelljs'),
    sinon = require('sinon'),
    moment = require('moment'),
    decache = require('decache'),
    _load = require('./_load.js');

describe('Config env from branch', function () {
    var config,
        env,
        clock,
        timestamp;

    before(function () {
        clock = sinon.useFakeTimers();
        timestamp = moment().format('YYYYMMDDHHmmss');
        config = _load('env');
        env = sh.exec('git status', { silent: true }).stdout;
        env = env ? env.split('\n')[0].replace(/^On branch ([\w-_/.]+)/, '$1') : undefined;

        env = env ? _.truncate(env, {
            length: 13,
            omission: ''
        }) : undefined;
    });

    it('should have env variables at top', function () {
        config.lower.should.equal(env);
        config.upper.should.equal(env.toUpperCase());
        config.token.should.equal('token-' + timestamp);
    });

    it('should have env variables in obj', function () {
        config.obj1.obj2.lower.should.equal(env);
        config.obj1.obj2.upper.should.equal(env.toUpperCase());
        config.obj1.obj2.token.should.equal('token-' + timestamp);
    });

    it('should have env variables in obj', function () {
        config.list1[0].should.equal(env);
        config.list1[1].should.equal(env.toUpperCase());
        config.list1[2].should.equal('token-' + timestamp);
    });

    after(function () {
        clock.restore();
    });
});
