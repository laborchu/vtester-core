'use strict';
var Path = require('../path');
var should = require('should');
var PressPlugin = module.exports = Path.extend({
	getTemplate:function(config){
        return `.getRect().then(rect=>{
            return driver.touch('drag',{ fromX: rect.x+<%=fromXOffset%>, fromY: rect.y+<%=fromYOffset%>, 
                               toX: rect.x+<%=toXOffset%>, toY: rect.y+<%=toYOffset%> })
        })`;
	},
	buildParams:function(config){
		return {
            "fromXOffset":config.fromXOffset,
            "fromYOffset":config.fromYOffset,
            "toXOffset":config.toXOffset,
            "toYOffset":config.toYOffset
        };
	},
    checkConfig : function(config){
        config.should.have.property('fromXOffset').instanceOf(Number).ok();
        config.should.have.property('fromYOffset').instanceOf(Number).ok();
        config.should.have.property('toXOffset').instanceOf(Number).ok();
        config.should.have.property('toYOffset').instanceOf(Number).ok();
        PressPlugin.__super__.checkConfig(config);
    }
});