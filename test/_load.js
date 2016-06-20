'use strict';

var sh = require('shelljs'),
    decache = require('decache');

module.exports = function(name) {
    decache('js-yaml');
    decache('yargs');
    decache('../');
    delete require.cache[require.resolve('../')];
    sh.cp('-f', __dirname + '/configs/' + name + '.yml', 'config.yml');

    return require('../');
};