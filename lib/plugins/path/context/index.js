'use strict';
var Path = require('../path');
var should = require('should');
var ContextPlugin = module.exports = Path.extend({
    getTemplate: function(config) {
        if (config.target === "native") {
            return `.contexts().then(arr => {
                      return driver.context(arr[0]);
                    })`;
        } else {
            if (config.vtestConfig.platform === "ios") {
                return `.contexts().then(arr => {
                      return driver.context(arr[arr.length - 1]);
                    })`;
            } else {
                return `.contexts().then(arr => {
                      return driver.context(arr[arr.length - 1]);
                    })
                    .windowHandles()
                    .then(handles => {
                      if (handles.length > 1) {
                        return driver.window(handles[handles.length - 1]);
                      }
                    })
                    .sleep(1000)`;
            }
        }

    },
    buildParams: function(config) {
        return {};
    },
    checkConfig: function(config) {
        config.should.have.property('target').instanceOf(String);
        if (config.target !== 'native' && config.target !== 'webview') {
            throw new Error('target should in (native|webview)');
        }
        ContextPlugin.__super__.checkConfig(config);
    }
});
