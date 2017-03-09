'use strict';
var _ = require('lodash');
var should = require('should');
var Plugin = module.exports = function(){

};
Plugin.prototype.init = function(name){
	this.name = name;
};

Plugin.prototype.getTemplate = function(config){
	throw new Error("please override getTemplate function");
};
Plugin.prototype.buildParams = function(config){
	throw new Error("please override buildParams function");
};
Plugin.prototype.build = function(config){
    var compiled = _.template(this.getTemplate(config));
    if(config.vtestConfig.platform==="android"){
    	config.context = config.context || 'navite';
    }
    return compiled(this.buildParams(config));
};
Plugin.prototype.checkConfig = function(config){
    if (config.hasOwnProperty('context')) {
    	['navite','webview'].should.containEql(config.context);
    }
    if (config.hasOwnProperty('sleep')) {
        should(config.sleep).instanceOf(Number);
    }
};
Plugin.prototype.getAndroidResId = function(config,resId){
	if(resId.indexOf(":id/")!=-1||'webview'==config.context){
		return resId;
	}else{
		return `${config.vtestConfig.package}:id/${resId}`;
	}
    
};
Plugin.extend = require('class-extend').extend;