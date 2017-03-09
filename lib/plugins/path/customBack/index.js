'use strict';
var Path = require('../path');
var should = require('should');
var CustomBackPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		return '.customBack()';
	},
	buildParams:function(config){
        return {};
	},
    checkConfig : function(config){
    }
});