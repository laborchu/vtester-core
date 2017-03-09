'use strict';
var Path = require('../path');
var should = require('should');
var CmdPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		return `.getContentDesc().then(function(desc){
                    let cmdArray = desc;
                    let cmdObj;
                    if(cmdArray.length>0){
                    	for(let i=cmdArray.length-1 ; i>=0 ; i--){
                    		var cmd = cmdArray[i];
                    		if(cmd.cmdCode=='<%=cmdCode%>'){
	                            cmdObj = cmd;
	                            break;
	                        }
                    	}
                    }
                    if(cmdObj){
                    	driver.cacheCmds.push(cmdObj);
                    }
                })`;
	},
	buildParams:function(config){
		return { 'cmdCode': config.cmdCode};
	},
    checkConfig : function(config){
        config.should.have.property('cmdCode').instanceOf(String);
        config.should.have.property('subType').instanceOf(String);
        CmdPlugin.__super__.checkConfig(config);
    }
});