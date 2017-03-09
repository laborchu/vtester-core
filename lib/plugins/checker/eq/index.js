'use strict';
var Checker = require('../checker');
var should = require('should');
var EqPlugin = module.exports = Checker.extend({
	getTemplate:function(config){
        if(config.selector===undefined){
            if(config.vtestConfig.platform==="android"){
                return `.getProperty("text").then(function(prop){
                    should(prop.text).equal("<%= value %>");
                })`;
            }else if(config.vtestConfig.platform==="ios"){
                return `.getProperty("value").then(function(prop){
                    should(prop).equal("<%= value %>");
                })`;
            }else{
                return `.text().then(function(element) {
                    "<%= value %>".should.equal(element);
                })`;
            }
        }
		if (config.selector == "xpath") {
            return '.elementByXPathOrNull("<%= xpath %>").text()\
            .then(function(element) {\
            	"<%= value %>".should.equal(element);\
            })';
        }else if(config.selector == "id") {
            if(config.vtestConfig.platform==="android"){
                return `.elementById("<%= id %>").getProperty("text").then(function(prop){
                    should(prop.text).equal("<%= value %>");
                })`;
            }else if(config.vtestConfig.platform==="ios"){
                return `.elementById("<%= id %>").getProperty("value").then(function(prop){
                    should(prop).equal("<%= value %>");
                })`;
            }
            
        }
	},
	buildParams:function(config){
        if(config.selector===undefined){
            return {'value': config.value};
        }
		if (config.selector == "xpath") {
            return { 'xpath': config.element, 'value': config.value};
        } else if (config.selector == "id") {
            if(config.vtestConfig.platform==="android"){
                return { 'id': this.getAndroidResId(config,config.element), 'value': config.value};
            }else{
                return { 'id': config.element, 'value': config.value};
            }
        }
	},
    checkConfig : function(config){
        if(config.selector!==undefined){
            config.should.have.property('selector').instanceOf(String).ok();
            config.should.have.property('element').instanceOf(String).ok();
        }
        config.should.have.property('value');
        EqPlugin.__super__.checkConfig(config);
    }
});