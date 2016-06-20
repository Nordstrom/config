'use strict';

var _ = require('lodash'),
    should = require('should'),
    sh = require('shelljs'),
    sinon = require('sinon'),
    moment = require('moment'),
    decache = require('decache'),
    _load = require('./_load.js');

describe('Config env from branch with regex', function () {
    var config,
        env,
        clock,
        timestamp;

    before(function () {
        clock = sinon.useFakeTimers();
        timestamp = moment().format('YYYYMMDDHHmmss');
        config = _load('env-w-regex');
        env = sh.exec('git status', { silent: true }).stdout;
        console.log(env);
        env = env ? env.split('\n')[0].replace(/^#?\s?On branch ([\w-_/.]+)/, '$1') : undefined;
        env = env.replace(/\w(\w+)\w/, '$1');

        env = env ? _.truncate(env, {
            length: 13,
            omission: ''
        }) : undefined;
    });

    it('should have env variables at top', function () {
        config.lower.should.equal(env);
        config.upper.should.equal(env.toUpperCase());
    });

    it('should have env variables in obj', function () {
        config.obj1.obj2.lower.should.equal(env);
        config.obj1.obj2.upper.should.equal(env.toUpperCase());
    });

    it('should have env variables in obj', function () {
        config.list1[0].should.equal(env);
        config.list1[1].should.equal(env.toUpperCase());
    });

    after(function () {
        clock.restore();
    });
});
