'use strict';
var Path = require('../path');
var should = require('should');
var GetPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		if(config.selector == "id") {
            return `.elementsById("<%= id %>").then(elements=>{
                <%if(index!==undefined){%>
                    return elements[<%=index-1%>];
                <%}else{%> 
                    if(elements.length==0){
                        <%if(error){%>
                            throw new Error(error)
                        <%}else{%> 
                            return null;
                        <%}%> 
                    }
                    should(elements).be.not.empty();
                    let value = "";
                    <%if(filter){%>
                        <%if(isExp){%>
                            value = <%=filter.value%>;
                        <%}else{%> 
                            value = '<%=filter.value%>';
                        <%}%> 
                    <%}%> 
                    var call = function(index){
                        <%if(mode=='first'){%>
                            if(elements.length==index){
                                <%if(error){%>
                                    throw new Error(error)
                                <%}else{%> 
                                    return null;
                                <%}%> 
                            }
                        <%}else{%> 
                            if(-1==index){
                                <%if(error){%>
                                    throw new Error(error)
                                <%}else{%> 
                                    return null;
                                <%}%> 
                            }
                        <%}%>
                        <%if(filter){%>
                            return elements[index].getProperty('<%=filter.target%>').then(function(desc){
                                let cmpV = "";
                                let cacheV;
                                <%if(filter.target=="description"){%>
                                    cacheV = JSON.parse(desc.description);
                                    cmpV = cacheV['<%=filter.property%>']
                                <%}else if(filter.target=="value"){%>
                                    <%if(filter.property){%>
                                        cacheV = JSON.parse(desc);
                                        cmpV = cacheV['<%=filter.property%>']
                                    <%}else{%>
                                        cacheV = desc;
                                        cmpV = desc.replace(/(^\\s*)|(\\s*$)/g, "");
                                    <%}%>   
                                <%}else{%>
                                    cmpV = desc.text;
                                    cacheV = desc.text;
                                <%}%>

                                <%if(cacheElement){%>
                                    driver.cacheElements.push(elements[index]);
                                <%}%>
                                <%if(cacheDesc){%>
                                    driver.cacheDescs.push(cacheV);
                                <%}%>

                                let compResult = false;
                                <%if(filter.op=="=="||filter.op==">"||filter.op=="!="){%>
                                    compResult = (cmpV<%=filter.op%>value);
                                <%}else if(filter.op=="in"){%>
                                    compResult = (value.indexOf(cmpV) > -1);
                                <%}%>

                                if(compResult){
                                    return elements[index];
                                }else{
                                    <%if(mode=='first'){%>
                                        return call(++index);
                                    <%}else{%> 
                                        return call(--index);
                                    <%}%>
                                }
                                
                            })
                        <%}else{%> 
                            <%if(cacheDesc){%>
                                return elements[index].getProperty('<%=cacheTarget%>').then(function(desc){
                                    <%if(cacheTarget=="description"){%>
                                    var descObj = JSON.parse(desc.description);
                                    <%}else if(cacheTarget=="value"){%>
                                    var descObj = JSON.parse(desc);
                                    <%}else{%>
                                    var descObj = desc.text;
                                    <%}%>
                                    driver.cacheDescs.push(descObj);
                                     <%if(cacheElement){%>
                                        driver.cacheElements.push(elements[index]);
                                    <%}%>
                                    return elements[index];
                                })
                            <%}else{%> 
                                 <%if(cacheElement){%>
                                    driver.cacheElements.push(elements[index]);
                                <%}%>
                                return elements[index];
                            <%}%>
                        <%}%>
                    }
                    if(elements.length>0){
                        <%if(mode=='first'){%>
                            return call(0);
                        <%}else{%> 
                            return call(elements.length-1);
                        <%}%>
                    }
                <%}%>
                
            })`;
        }
	},
	buildParams:function(config){
		if(config.selector == "id"){
            var cacheElement = config.cacheElement||false;
            var cacheDesc = config.cacheDesc||false;
            var mode = config.mode||'first';
            var error = config.error||'';
			 if(config.vtestConfig.platform==="android"||config.vtestConfig.platform==="ios"){
                var result = { 
                    'mode':mode, 
                    'filter':null, 
                    'error':error, 
                    'cacheElement':cacheElement,
                    'cacheDesc':cacheDesc,
                    'cacheTarget':config.cacheTarget,
                    'isExp':false,
                    'index':config.index
                };
                if(config.vtestConfig.platform==="android"){
                    result.id = this.getAndroidResId(config,config.element);
                }else{
                    result.id = config.element;
                }
                if(config.filter){
                    result.filter = config.filter;
                    if (typeof config.filter.value === 'string' || config.filter.value instanceof String){
                        if(config.filter.value.startsWith("${")&&config.filter.value.endsWith("}")){
                            result.isExp = true;
                            result.filter.value = config.filter.value.replace("${","").replace("}","");
                        }
                    }
                }
                return result;
            }else{
                return { 'id': config.element, 'value': config.value};
            }
		}
	},
    checkConfig : function(config){
        config.should.have.property('selector').instanceOf(String).ok();
        config.should.have.property('element').instanceOf(String).ok();
        if (config.selector !== 'id') {
            throw new Error('config.selector should in (id)');
        }
        if (config.cacheElement !== undefined) {
            config.should.have.property('cacheElement').instanceOf(Boolean);
        }
        if (config.cacheDesc !== undefined) {
            config.should.have.property('cacheDesc').instanceOf(Boolean);
            if(config.cacheDesc){
                if(config.vtestConfig.platform==="android"){
                    config.cacheTarget = 'description';
                }else if(config.vtestConfig.platform==="ios"){
                    config.cacheTarget = 'value';
                }
            }
        }
        if(config.filter){
            config.filter.should.have.property('op').instanceOf(String);
            config.filter.should.have.property('value');
            if (config.filter.op !== '=='&&
                config.filter.op !== '>'&&
                config.filter.op !== 'in'&&
                config.filter.op !== '!=') {
                throw new Error(`filter.op [${config.filter.op}] should in (==|>|in|!=)`);
            }
            if (config.filter.target) {
                config.filter.target.should.instanceOf(String).ok();
                if (config.filter.target !== 'description' && 
                    config.filter.target !== 'text' &&
                    config.filter.target !== 'value') {
                    throw new Error('filter.target should in (description|text|value)');
                }
            }else{
                if(config.vtestConfig.platform==="android"){
                    config.filter.target = 'description';
                }else if(config.vtestConfig.platform==="ios"){
                    config.filter.target = 'value';
                }
            }
            if(config.filter.target=='description'||config.filter.target=='value'){
                //config.filter.should.have.property('property').instanceOf(String).ok();
            }
            
        }
        if(config.mode){
            if (config.mode !== 'first'&&config.mode !== 'last') {
                throw new Error('config.mode should in (first|last)');
            }
        }
        if(config.index){
            config.index.should.instanceOf(Number);
        }
        GetPlugin.__super__.checkConfig(config);
    }
});