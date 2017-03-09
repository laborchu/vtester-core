'use strict';
var Checker = require('../checker');
var should = require('should');
var EqPlugin = module.exports = Checker.extend({
	getTemplate:function(config){
		if(config.selector == "id") {
            if(config.vtestConfig.platform==="android"){
                return `.elementsById("<%= id %>").then(function(elements){
                    elements.should.be.not.empty();
                })`;
            }
        }
	},
	buildParams:function(config){
		if (config.selector == "id") {
            if(config.vtestConfig.platform==="android"){
                return { 'id': this.getAndroidResId(config,config.element), 'value': config.value};
            }else{
                return { 'id': config.element, 'value': config.value};
            }
        }
	},
    checkConfig : function(config){
        config.should.have.property('selector').instanceOf(String).ok();
        config.should.have.property('element').instanceOf(String).ok();
        if (config.selector !== 'id') {
            throw new Error('selector should in (id)');
        }
        EqPlugin.__super__.checkConfig(config);
    }
});