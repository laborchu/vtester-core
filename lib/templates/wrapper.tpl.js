require('should');
let path = require('path');
let fs = require('fs');
var should = require('should');

<%if (handler) {%>
    var handler = require("<%=relativePath%>handler/<%=handlerName%>")
<%}%>

let uc = process.env.uc;

const wd = require('macaca-wd');
const driver = wd.promiseChainRemote({
    host: 'localhost',
    port: 3456
  });

<%if (vtestConfig.platform == 'electron') {%>
    var paltformConfig = {
        platformName: 'desktop',
        browserName: 'electron'
    };

    driver.cacheElements = [];
<%} else if (vtestConfig.platform == 'android') {%>
    var paltformConfig = {
        platformName: 'Android',
        reuse:3,
        package: '<%= vtestConfig.package%>',
        activity: '<%= vtestConfig.activity%>',
        udid: "<%= vtestConfig.udid%>"
    };

    driver.cacheElements = [];
    driver.cacheDescs = [];
    driver.cacheCmds = [];
    var handler = require("<%=relativePath%>handler/handler.js");
    require("<%=relativePath%>dist/vtester.driver.js")(wd,driver,"<%=vtestConfig.platform%>");
    var router = require("<%=relativePath%>dist/router.js");
<%} else if (vtestConfig.platform == 'ios') {%>
    var paltformConfig = {
        platformName: 'iOS',
        reuse:3,
        bundleId: '<%= vtestConfig.bundleId%>',
        platformVersion: '<%= vtestConfig.platformVersion%>',
        deviceName: "<%= vtestConfig.deviceName%>",
        autoAcceptAlerts:false
    };

    driver.cacheElements = [];
    driver.cacheDescs = [];
    driver.cacheCmds = [];
    var handler = require("<%=relativePath%>handler/handler.js");
    require("<%=relativePath%>dist/vtester.driver.js")(wd,driver,"<%=vtestConfig.platform%>");
    var router = require("<%=relativePath%>dist/router.js");
<%}%>

driver.preLastUcKey = null;
if (uc===undefined&&fs.existsSync("data.log")) {
    driver.preLastUcKey = fs.readFileSync("data.log", 'utf8');
    if(driver.preLastUcKey.length==0){
        driver.preLastUcKey = null;
    }else{
        driver.preLastUcKey = driver.preLastUcKey.replace("\r","").replace("\n","");
    }
}

describe('自动化测试', function () {
    this.timeout(5 * 60 * 1000);
    <%if (vtestConfig.platform == 'electron') {%>
        before(() => {
            return driver
                .init(paltformConfig);
        });
    <%} else if (vtestConfig.platform == 'android'||vtestConfig.platform == 'ios') {%>
        driver.configureHttp({
            timeout: 600000
        });

        before(() => {
            return driver.init(paltformConfig);
        });
    <%}%>

    <%= body %>
        after((done) => {
            return driver
                .sleep(1000)
                .quit().then(function(){
                    done();
                });
        });
});
