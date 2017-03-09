'use strict';
var Path = require('../path');
var should = require('should');
var IndexPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		return ".get('<%= url %>')";
	},
	buildParams:function(config){
		return { 'url': config.url };
	},
	checkConfig : function(config){
		config.should.have.property('url').instanceOf(String).ok();
		IndexPlugin.__super__.checkConfig(config);
	}
});