'use strict';
var Path = require('../path');
var should = require('should');
var InputPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		if (config.target == "dismiss") {
            return '.dismissAlert()';
		}else if(config.target == "accept"){
            return '.acceptAlert()';
		}
	},
	buildParams:function(config){
		return {};
	},
    checkConfig : function(config){
        config.should.have.property('target').instanceOf(String).ok();
        if (config.target !== 'dismiss' && config.target !== 'accept') {
            throw new Error('target should in (dismiss|accept)');
        }
        InputPlugin.__super__.checkConfig(config);
    }
});