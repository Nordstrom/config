'use strict';

var sh = require('shelljs'),
    decache = require('decache');

module.exports = function(name) {
    decache('../');
    sh.cp('-f', __dirname + '/configs/' + name + '.yml', 'config.yml');
    return require('../');
};