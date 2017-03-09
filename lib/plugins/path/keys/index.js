'use strict';
var Path = require('../path');
var should = require('should');
var KeysPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		return '.keys("<%= value %>")';
	},
	buildParams:function(config){
		return { 'value': config.value};
	},
    checkConfig : function(config){
        config.should.have.property('value');
        KeysPlugin.__super__.checkConfig(config);
    }
});