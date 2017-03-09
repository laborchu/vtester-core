'use strict';
var Plugin = require('../plugin');
var Checker = module.exports = Plugin.extend({
});
Checker.prototype.checkConfig = function(config){
	Checker.__super__.checkConfig(config);
};