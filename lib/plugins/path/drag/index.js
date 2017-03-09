'use strict';
var Path = require('../path');
var should = require('should');
var DragPlugin = module.exports = Path.extend({
	getTemplate:function(config){
        return `.touch('drag',{ fromX: <%=fromX%>, fromY: <%=fromY%>,
                                   toX: <%=toX%>, toY: <%=toY%> })`;
	},
	buildParams:function(config){
		return {
            "fromX":config.fromX,
            "fromY":config.fromY,
            "toX":config.toX,
            "toY":config.toY
        };
	},
    checkConfig : function(config){
        config.should.have.property('fromX').instanceOf(Number).ok();
        config.should.have.property('fromY').instanceOf(Number).ok();
        config.should.have.property('toX').instanceOf(Number).ok();
        config.should.have.property('toY').instanceOf(Number).ok();
        DragPlugin.__super__.checkConfig(config);
    }
});
