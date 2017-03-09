'use strict';
var Checker = require('../checker');
var should = require('should');
var AjaxPlugin = module.exports = Checker.extend({
	getTemplate:function(config){
		return '.elementByXPathOrNull("//div[contains(@class, \'ajax-result\')]/div[@data-url=\'<%= url %>\'][last()]")\
		.getAttribute("data-res")\
		.then(function(element) {\
			handler.<%= doer %>(element)\
		})';
	},
	buildParams:function(config){
		return { 'url': config.url, 'doer': config.doer};
	},
    checkConfig : function(config){
        config.should.have.property('url').instanceOf(String).ok();
        config.should.have.property('doer').instanceOf(String).ok();
        AjaxPlugin.__super__.checkConfig(config);
    }
});