'use strict';
var Path = require('../path');
var should = require('should');
var InputPlugin = module.exports = Path.extend({
	getTemplate:function(config){
        if(config.selector===undefined){
            if(config.clear===false){
                return '.sendKeys("<%= value %>")';
            }else{
                return '.clear().sendKeys("<%= value %>")';
            }
        }
		if (config.selector == "name") {
            if(config.clear===false){
                return '.elementByName("<%= name %>").sendKeys("<%= value %>")';
            }else{
                return '.elementByName("<%= name %>").clear().sendKeys("<%= value %>")';
            }
		}else if(config.selector == "xpath"){
            if(config.clear===false){
                return '.elementByXPathOrNull("<%= xpath %>").sendKeys("<%= value %>")';
            }else{
                return '.elementByXPathOrNull("<%= xpath %>").clear().sendKeys("<%= value %>")';
            }
		}else if(config.selector == "id") {
            if(config.clear===false){
                return '.elementById("<%= id %>").sendKeys("<%= value %>")';
            }else{
                return '.elementById("<%= id %>").clear().sendKeys("<%= value %>")';
            }
        }
	},
	buildParams:function(config){
        if(config.selector===undefined){
            return {'value': config.value };
        }
		if (config.selector == "name") {
			return { 'name': config.element, 'value': config.value };
		}else if(config.selector == "xpath"){
			return { 'xpath': config.element, 'value': config.value };
		}else if(config.selector == "id"){
			 if(config.vtestConfig.platform==="android"){
                return { 'id': this.getAndroidResId(config,config.element), 'value': config.value};
            }else{
                return { 'id': config.element, 'value': config.value};
            }
		}
	},
    checkConfig : function(config){
        if(config.selector!==undefined){
            config.should.have.property('element').instanceOf(String).ok();
            config.should.have.property('selector').instanceOf(String).ok();
            if (config.selector !== 'xpath' && config.selector !== 'name' && 
                config.selector !== 'className' && config.selector !== 'id') {
                throw new Error('path.selector should in (xpath|name|className|id)');
            }
        }
        
        config.should.have.property('value').instanceOf(String);
        if(config.clear!==undefined){
            config.clear.should.instanceOf(Boolean);
        }
        InputPlugin.__super__.checkConfig(config);
    }
});