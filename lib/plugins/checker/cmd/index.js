'use strict';
var Checker = require('../checker');
var should = require('should');
var CmdPlugin = module.exports = Checker.extend({
	getTemplate:function(config){
		if(config.vtestConfig.platform==="android"||config.vtestConfig.platform==="ios"){
                return `.getContentDesc().then(function(desc){
                    let cmdArray = desc.cmd;
                    cmdArray.should.be.not.empty();
                    let preCmd = null;
                    if(driver.cacheCmds.length>0){
                        preCmd = driver.cacheCmds.pop();
                    }
                    let curCmd = null;
                    for(let i=cmdArray.length-1 ; i>=0 ; i--){
                        var cmd = cmdArray[i];
                        if(cmd.cmdCode=='<%=cmdCode%>'){
                            curCmd = cmd;
                            break;
                        }
                    }
                    should(curCmd).be.ok();
                    if(!preCmd){
                        curCmd.should.have.value("sign", 1);
                    }else{
                        if(preCmd.token==curCmd.token){
                            throw new Error("cmd not send");
                        }else{
                            curCmd.should.have.value("sign", 1);
                        }
                    }
                })`;
            }
	},
	buildParams:function(config){
		if(config.vtestConfig.platform==="android"||config.vtestConfig.platform==="ios"){
            return { 'cmdCode': config.cmdCode};
        }
	},
    checkConfig : function(config){
        config.should.have.property('cmdCode').instanceOf(String).ok();
        CmdPlugin.__super__.checkConfig(config);
    }
});