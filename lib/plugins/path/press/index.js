'use strict';
var Path = require('../path');
var should = require('should');
var PressPlugin = module.exports = Path.extend({
	getTemplate:function(config){
        if(config.selector===undefined){
            return ".touch('press',{duration: <%=value%>})";
        }else{
            if(config.selector=="id"){
                return `.elementById("<%= id %>").touch('press',{duration: <%=value%>})`;
            }
        }
	},
	buildParams:function(config){
        var obj = {
            value:config.value
        };
        if (config.selector == "id") {
            if(config.vtestConfig.platform==="android"){
                obj.id = this.getAndroidResId(config,config.element);
            }else{
                obj.id = config.element;
            }
        }
		return obj;
	},
    checkConfig : function(config){
        if(config.selector){
            config.should.have.property('selector').instanceOf(String).ok();
            if (config.selector !== 'id') {
                throw new Error('path.selector should in (id)');
            }
        }
        if(config.element){
            config.should.have.property('element').instanceOf(String).ok();
        }
        config.should.have.property('value').instanceOf(Number).ok();
        PressPlugin.__super__.checkConfig(config);
    }
});