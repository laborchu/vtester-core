'use strict';
var Path = require('../path');
var should = require('should');
var ClicksPlugin = module.exports = Path.extend({
	getTemplate:function(config){
        return `.then(elements=>{
            let call = function(index){
                if(index>=(elements.length)){
                    return this;
                }
                return elements[index].click().then(function(){
                    return call(++index);
                })
            }
            if(elements.length>0){
                return call(0);
            }else{
                return this;
            }
            
        })`;
	},
	buildParams:function(config){
	},
    checkConfig : function(config){
        ClicksPlugin.__super__.checkConfig(config);
    }
});