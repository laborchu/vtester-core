'use strict';
var Path = require('../path');
module.exports = Path.extend({
	getTemplate:function(config){
		if(config.op=="input"){
			return '.safeEval("var ue = UE.getEditor(\'<%= name %>\');ue.setContent(\'<%= value %>\')")';
		}
	},
	buildParams:function(config){
		if(config.op=="input"){
			return { 'name': config.element ,'value': config.value };
		}
	}
});