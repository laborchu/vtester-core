"use strict";
var should = require('should');
var select = require('xpath.js')
    , dom = require('xmldom').DOMParser;
module.exports = function(wd,driver,platform){
    wd.addPromiseChainMethod('eqRawtext', function (id,value) {
        return this.source()
            .then(res => {
                var doc = new dom().parseFromString(res);
                var contentDesc = select(doc, "//node[@resource-id='"+id+"']/@text")[0].value;
                value.should.equal(contentDesc);
            });
    });

    wd.addPromiseChainMethod('customBack', function () {
        <%if (vtestConfig.platform == 'android') {%>
            return this.elementById("com.jiazi.eduos.fsc.prod:id/bar_left_txt").click();
        <%}else if (vtestConfig.platform == 'ios') {%>
            return this.elementByName("Back").click();
        <%}else{%>
            return this.back();
        <%}%>
    });

    wd.addPromiseChainMethod('getContentDesc', function () {
        <%if (vtestConfig.platform == 'android') {%>
        return this.source()
            .then(res => {
                var doc = new dom().parseFromString(res);
                var contentDesc = select(doc, "//node[@resource-id='android:id/content']/@content-desc")[0].value;
                return JSON.parse(contentDesc);
            });
        <%}else if (vtestConfig.platform == 'ios') {%>
            return this.elementById("id_ios-window").getProperty("value").then(desc=>JSON.parse(desc));
        <%}%>
    });

    wd.addPromiseChainMethod('popCacheElement', function () {
        if(driver.cacheElements&&driver.cacheElements.length>0){
            return driver.cacheElements.pop();
        }
    });

    <%= body %>
}
