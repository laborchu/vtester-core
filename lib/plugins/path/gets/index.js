'use strict';
var Path = require('../path');
var should = require('should');
var GetsPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		if(config.selector == "id") {
            return `.elementsById("<%= id %>").then(elements=>{
                <%if(limit==-1){%>
                    return elements;
                <%}else{%> 
                    if(elements.length < <%=limit%>){
                        return elements;
                    }else{
                        return elements.slice(0, <%=limit%>);;
                    }
                <%}%> 
            })`;
        }
	},
	buildParams:function(config){
		if(config.selector == "id"){
			 if(config.vtestConfig.platform==="android"||config.vtestConfig.platform==="ios"){
                var result = { 
                    limit:config.limit
                };
                if(config.vtestConfig.platform==="android"){
                    result.id = this.getAndroidResId(config,config.element);
                }else{
                    result.id = config.element;
                }
                return result;
            }else{
                return { 'id': config.element};
            }
		}
	},
    checkConfig : function(config){
        config.should.have.property('selector').instanceOf(String).ok();
        config.should.have.property('element').instanceOf(String).ok();
        if (config.selector !== 'id') {
            throw new Error('config.selector should in (id)');
        }
        if (config.limit!==undefined) {
            config.limit.should.instanceOf(Number);
        }else{
            config.limit = -1;
        }
        GetsPlugin.__super__.checkConfig(config);
    }
});