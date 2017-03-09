'use strict';
var Plugin = require('../plugin');
var should = require('should');
var Path = module.exports = Plugin.extend({
});

Path.prototype.checkConfig = function(config){
	should(config).ok();
    should(config).instanceOf(Object);
    config.should.have.property('title').instanceOf(String).ok();
    if (config.hasOwnProperty('checker')) {
        should(config.checker).ok();
        should(config.checker).instanceOf(Object);
    }
	Path.__super__.checkConfig(config);
};