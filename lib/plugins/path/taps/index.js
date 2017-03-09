'use strict';
var Path = require('../path');
var should = require('should');
var TapPlugin = module.exports = Path.extend({
	getTemplate:function(config){
        let processTaps =  `.then(elements=>{
            let call = function(index){
                if(index>=(elements.length)){
                    return this;
                }
                return elements[index].touch('tap').then(function(){
                    return call(++index);
                })
            }
            if(elements.length>0){
                return call(0);
            }else{
                return this;
            }
        })`;
        if(config.selector===undefined){
            return processTaps;
        }
		if (config.selector == "xpath") {
            return `.elementsByXPath("<%= xpath %>")${processTaps}`;
        } else if (config.selector == "className") {
            return `.elementsByClassName("<%= className %>")${processTaps}`;
        } else if (config.selector == "name") {
            return `.elementsByName("<%= name %>")${processTaps}`;
        }else if(config.selector == "id") {
            return `.elementsById("<%= id %>")${processTaps}`;
        }
	},
	buildParams:function(config){
        let result = {};
        if(config.selector===undefined){
            return result;
        }
		if (config.selector == "xpath") {
            result.xpath = config.element;
        } else if (config.selector == "className") {
            result.className = config.element;
        } else if (config.selector == "name") {
            result.name = config.element;
        } else if (config.selector == "id") {
            if(config.vtestConfig.platform==="android"){
                result.id = this.getAndroidResId(config,config.element);
            }else{
                result.id = config.element;
            }
        }
        return result;
	},
    checkConfig : function(config){
        if(config.selector){
            config.should.have.property('selector').instanceOf(String).ok();
            if (config.selector !== 'xpath' && config.selector !== 'name' && 
                config.selector !== 'className' && config.selector !== 'id') {
                throw new Error('path.selector should in (xpath|name|className|id)');
            }
        }
        if(config.element){
            config.should.have.property('element').instanceOf(String).ok();
        }
        TapPlugin.__super__.checkConfig(config);
    }
});