'use strict';
var Checker = require('../checker');
var should = require('should');
var EqsPlugin = module.exports = Checker.extend({
	getTemplate:function(config){
		if (config.selector == "xpath") {
            return '.elementsByXPath("<%= xpath %>").then(function(els) {\
            	return els.reduce(function (prev, el) {\
            		return prev.then(function() {\
            			return el.text().then(function(text){\
            				[<%= value %>].should.containEql(text);\
            			});\
            		});\
            	},Promise.resolve());\
            })';
        }
	},
	buildParams:function(config){
		if (config.selector == "xpath") {
            return { 'xpath': config.element, 'value': config.value};
        }
	},
    checkConfig : function(config){
        config.should.have.property('selector').instanceOf(String).ok();
        config.should.have.property('element').instanceOf(String).ok();
        config.should.have.property('value');
        EqsPlugin.__super__.checkConfig(config);
    }
});