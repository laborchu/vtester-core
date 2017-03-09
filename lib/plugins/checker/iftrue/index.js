'use strict';
var Checker = require('../checker');
var should = require('should');
var IfTruePlugin = module.exports = Checker.extend({
	getTemplate:function(config){
		if (config.selector == "xpath") {
            return '.elementByXPathOrNull("<%= xpath %>")\
            <%=textTpl%>.then(function(element) {\
            	if((element?element:"")!=="<%= value %>"){\
            		<%= body %>\
            	}\
            })';
        }
	},
	buildParams:function(config){
        var textTpl = ".text()";
        if(config.value===null){
            textTpl = "";
        }
		if (config.selector == "xpath") {
            return { 'xpath': config.element, 'value': config.value, 'body': config.body,'textTpl':textTpl };
        }
	},
    checkConfig : function(config){
        config.should.have.property('selector').instanceOf(String).ok();
        config.should.have.property('element').instanceOf(String).ok();
        config.should.have.property('value');
        config.should.have.property('paths').instanceOf(Array).and.not.empty();
        IfTruePlugin.__super__.checkConfig(config);
    }
});