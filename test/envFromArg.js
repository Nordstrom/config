'use strict';

var should = require('should'),
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

    describe('from branch', function() {
        before(function () {
            clock = sinon.useFakeTimers();
            timestamp = moment().format('YYYYMMDDHHmmss');
            config = _load('env');
            env = sh.exec('git status', { silent: true }).stdout;
            env = env ? env.split('\n')[0].replace(/^On branch ([\w-_/.]+)/, '$1') : undefined;
        });

        it('should have env variables at top', function () {
            config.lower.should.equal(env);
            config.upper.should.equal(env.toUpperCase());
            config.token.should.equal('token-' + timestamp);
        });

        it('should have env variables in obj', function(){
            config.obj1.obj2.lower.should.equal(env);
            config.obj1.obj2.upper.should.equal(env.toUpperCase());
            config.obj1.obj2.token.should.equal('token-' + timestamp);
        });

        it('should have env variables in obj', function(){
            config.list1[0].should.equal(env);
            config.list1[1].should.equal(env.toUpperCase());
            config.list1[2].should.equal('token-' + timestamp);
        });

        after(function(){
            clock.restore();
        });
    });

    describe('from env arg', function() {
        before(function () {
            env = 'argenv';
            decache('yargs');
            // require('yargs').reset();
            process.argv[2] = '--env';
            process.argv[3] = env;
            process.env.ENVIRONMENT_ID = 'blah';
            console.log(process.env);
            console.log(process.argv);
            config = _load('env');
        });

        it('should have env variables at top', function () {
            config.lower.should.equal(env);
            config.upper.should.equal(env.toUpperCase());
        });

        it('should have env variables in obj', function(){
            config.obj1.obj2.lower.should.equal(env);
            config.obj1.obj2.upper.should.equal(env.toUpperCase());
        });

        it('should have env variables in obj', function(){
            config.list1[0].should.equal(env);
            config.list1[1].should.equal(env.toUpperCase());
        });
    });
});
