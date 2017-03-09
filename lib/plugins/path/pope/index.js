'use strict';
var Path = require('../path');
var should = require('should');
var PopePlugin = module.exports = Path.extend({
	getTemplate:function(config){
        return '.popCacheElement()';
	},
	buildParams:function(config){
        return {};
	},
    checkConfig : function(config){
        PopePlugin.__super__.checkConfig(config);
    }
});