"use strict";
let _ = require('lodash');
let path = require('path');
let helper = require('./helper');
let fs = require('fs');
var should = require('should');


const PLUGIN_PATH = "path";
const PLUGIN_CHECKER = "checker";
const UC_FILE_SUFFIX = '.uc.js';



class UcBuilder {
    constructor(itContent) {
        this.itContent = itContent || "return driver";
    }

    sleep(time) {
        this.itContent = this.itContent.concat(`.sleep(${time})`);
        return this;
    }

    append(content) {
        this.itContent = this.itContent.concat(content);
        return this;
    }

    toString() {
        return this.itContent;
    }
}

var Vtester = function() {
    this.plugins = {
        path: {},
        checker: {}
    };
    this.tplPath = path.join(__dirname,"templates");
    this.pluginsPath = path.join(__dirname,"plugins");

};

Vtester.prototype._loadPlugins = function(rootPath, cat) {
    var self = this;
    var pluginFolder = path.join(rootPath, cat);
    var pluginFiles = fs.readdirSync(pluginFolder);
    pluginFiles.forEach(function(filename) {
        var filePath = path.join(pluginFolder, filename);
        if (fs.lstatSync(filePath).isDirectory()) {
            var pluginPath = path.join(filePath, "index.js");
            if (fs.existsSync(pluginPath)) {
                var Plugin = require(pluginPath);
                var plugin = new Plugin();
                plugin.init(filename);
                self.plugins[cat][filename] = plugin;
            }
        }
    });
};

Vtester.prototype._buildPath = function(index, paths, builder) {
    var self = this;
    var step = paths[index];
    if (step.type) {
        var pathPlugin = self.plugins.path[step.type];
        if (pathPlugin) {
            let config = _.extend(step, { vtestConfig: self.vtestConfig });
            helper.checkPathConfig(pathPlugin, config); //检查配置
            builder.append(pathPlugin.build(config));
        }
    }

    if (step.sleep && step.sleep > 0) {
        builder.sleep(step.sleep);
    }

    var goNext = function(targetBuilder) {
        if (paths.length > (index + 1)) {
            self._buildPath(index + 1, paths, targetBuilder);
        }
    };

    if (step.checker) {
        var hasStop = false;
        Object.keys(step.checker).forEach(function(key) {
            var checkData = step.checker[key];
            var checkerPlugin = self.plugins.checker[key];
            if (checkerPlugin) {
                let checkDataConfig = _.extend(checkData, { vtestConfig: self.vtestConfig });
                helper.checkCheckerConfig(checkerPlugin, checkDataConfig); //检查配置
                if (key == "stop") {
                    hasStop = true;
                    let stopBuilder = new UcBuilder();
                    goNext(stopBuilder);
                    let config = _.extend({ body: stopBuilder.toString() }, checkData, { vtestConfig: self.vtestConfig });
                    builder.append(checkerPlugin.build(config));
                } else if (key == "iftrue") {
                    let iftrueBuilder = new UcBuilder();
                    self._buildPath(0, checkData.paths, iftrueBuilder);
                    let config = _.extend({ body: iftrueBuilder.toString() }, checkData, { vtestConfig: self.vtestConfig });
                    builder.append(checkerPlugin.build(config));
                } else {
                    let config = _.extend(checkData, { vtestConfig: self.vtestConfig });
                    builder.append(checkerPlugin.build(config));
                }
            }
            if (checkData.sleep && checkData.sleep > 0) {
                builder.sleep(checkData.sleep);
            }
        });
        if (!hasStop) {
            goNext(builder);
        }
    } else {
        goNext(builder);
    }

};

Vtester.prototype._buildUc = function(itCache, uc, index) {
    index = index || 0;
    var self = this;
    //处理前置uc
    var preTplStr = "";
    if (uc.preUc) {
        if (!_.isString(uc.preUc)) {
            self.log(uc.preUc + " should is string");
        } else if (!itCache[uc.preUc]) {
            self.log(uc.preUc + " not find uc");
        } else {
            preTplStr = self._buildUc(itCache, itCache[uc.preUc]);
        }
    }
    helper.checkUcConfig(uc, index);
    //处理uc
    var params = { "title": uc.title, "ucKey": uc.ucKey };
    var readmeTpl;
    var prePath = "";
    //判断uc是否存在path
    if (uc.paths && _.isArray(uc.paths) && uc.paths.length > 0) {
        var builder = new UcBuilder();
        self._buildPath(0, uc.paths, builder);
        if (uc.sleep && uc.sleep > 0) {
            builder.sleep(uc.sleep);
        }
        params.body = builder.toString();
        if (uc.only && uc.only === true) {
            params.only = true;
        } else {
            params.only = false;
        }
        readmeTpl = _.template(fs.readFileSync(path.join(self.tplPath, "it.tpl.js")));
        let tempUc = uc;
        let ucKeyLink = "";
        while (tempUc.parentUc) {
            ucKeyLink = ((tempUc.parentUc.ucKey || tempUc.parentUc.title) + "-" + ucKeyLink);
            tempUc = tempUc.parentUc;
        }
        params.ucKeyLink = ucKeyLink;
        var itStr = readmeTpl(params);
        if (uc.children && _.isArray(uc.children)) {
            prePath = itStr;
        } else {
            preTplStr = preTplStr.concat(itStr);
        }
    }
    if (uc.children && _.isArray(uc.children)) {
        let content = "";
        if (prePath) {
            content = prePath;
        }
        uc.children.forEach((child) => {
            child.parentUc = uc;
            var it = self._buildUc(itCache, child, index + 1);
            content = content.concat(it);
        });
        params.body = content;
        if (self.pageMap && self.pageMap[uc.ucKey]) {
            params.isTopUc = true;
            params.winName = self.pageMap[uc.ucKey].ucKey;
        } else {
            params.isTopUc = false;
        }
        if (uc.only && uc.only === true) {
            params.only = true;
        } else {
            params.only = false;
        }
        readmeTpl = _.template(fs.readFileSync(path.join(self.tplPath, "describe.tpl.js")));
        var describeStr = readmeTpl(params);
        preTplStr = preTplStr.concat(describeStr);
    }
    return preTplStr;
};

Vtester.prototype._buildDriver = function() {
    var self = this;
    var driverStr = "";
    if (this.pageLink) {
        for (var key in this.pageLink) {
            var link = this.pageLink[key];
            if (link.paths && _.isArray(link.paths) && link.paths.length > 0) {
                var builder = new UcBuilder("return this");
                self._buildPath(0, link.paths, builder);
                if (link.sleep && link.sleep > 0) {
                    builder.sleep(link.sleep);
                }
                let readmeTpl = _.template(fs.readFileSync(path.join(self.tplPath, "promise-chain-method.tpl.js")));
                driverStr += readmeTpl({
                    name: key,
                    body: builder.toString()
                });
            }
        }
    }
    return driverStr;
};

Vtester.prototype._iteratorUc = function(itCache, children) {
    children.forEach(child => {
        if (child.ucKey) {
            itCache[child.ucKey] = child;
        }
        if (child.children && _.isArray(child.children)) {
            this._iteratorUc(itCache, child.children);
        }
    });
};

Vtester.prototype.build = function(projectPath) {
    should.exist(projectPath);
    this.vtestConfig = require(path.join(projectPath, "vtester.json"));
    this.ucPath = path.join(projectPath, "/src/uc/");
    this.ucDistPath = path.join(projectPath, "/src/dist/");
    this.handlerPath = path.join(projectPath, "/src/handler/");
    this.pagePath = path.join(projectPath, "/src/page.map.js");

    //读取path plugin
    this._loadPlugins(this.pluginsPath, PLUGIN_PATH);
    //读取checker plugin
    this._loadPlugins(this.pluginsPath, PLUGIN_CHECKER);

    if (!fs.existsSync(this.ucDistPath)) {
    	fs.mkdirSync(this.ucDistPath);
    }
    helper.emptyDir(this.ucDistPath);
    //读取所有的uc文件
    var files = helper.readFile(this.ucPath, UC_FILE_SUFFIX);

    //缓存uc文件数据
    var ucArray = [];
    var fileNameArray = [];
    files.forEach(file => {
        var uc = require(file);
        ucArray.push(uc);
        var fileName = file.replace(this.ucPath, "");
        fileNameArray.push(fileName);
    });

    //缓存it数据
    var itCache = new Map();
    ucArray.forEach((ucData) => {
        if (ucData.children && _.isArray(ucData.children)) {
            this._iteratorUc(itCache, ucData.children);
        }
    });
    let ucFileNameMap = new Map();
    //开始生产文件
    ucArray.forEach((uc, index) => {
        var relativePath = "../";
        var arr  = fileNameArray[index].match(new RegExp('\\\\', "g"));
        if (arr && arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                relativePath = '../' + relativePath;
            }
        }

        if (uc.build === undefined || uc.build === true) {
            //处理handler
            let handler = false;
            let handlerName = "";
            //判断handler是否开启，如果开启，生成handler文件
            if (uc.handler && uc.handler === true) {
                handler = true;
                handlerName = fileNameArray[index].replace("uc", "handler");
                handlerName = handlerName.replace(/\\/g, "/");
                let handlerFile = path.join(this.handlerPath, handlerName);
                if (!fs.existsSync(handlerFile)) {
                    let handlerTpl = _.template(fs.readFileSync(path.join(this.tplPath, "handler.tpl.js")));
                    fs.writeFileSync(handlerFile, handlerTpl());
                }
            }
            helper.checkUcFile(fileNameArray[index]);
            let fileContent = this._buildUc(itCache, uc);
            if (this.vtestConfig.platform == 'android' || this.vtestConfig.platform == 'ios') {
                var fileName = fileNameArray[index];
                ucFileNameMap[uc.ucKey] = `require('./${fileName}')(driver,router);`;
                let wrapperTpl = _.template(fs.readFileSync(path.join(this.tplPath, "android-wrapper.tpl.js")));
                fs.writeFileSync(path.join(this.ucDistPath, fileNameArray[index]), wrapperTpl({
                    "body": fileContent,
                    "handler": handler,
                    "handlerName": handlerName,
                    "relativePath": relativePath
                }));

            } else if (this.vtestConfig.platform == 'electron') {
                let wrapperTpl = _.template(fs.readFileSync(path.join(this.tplPath, "wrapper.tpl.js")));
                fs.writeFileSync(path.join(this.ucDistPath, fileNameArray[index]), wrapperTpl({
                    "body": fileContent,
                    "vtestConfig": this.vtestConfig,
                    "handler": handler,
                    "handlerName": handlerName,
                    "relativePath": relativePath
                }));
            }
        }
    });

    if (this.vtestConfig.platform == 'android' || this.vtestConfig.platform == 'ios') {
        //处理 pageMap
        if (fs.existsSync(this.pagePath)) {
            let pageConfig = require(this.pagePath);
            this.pageArray = pageConfig.pageTree;
            this.pageLink = pageConfig.pageLink;
            this.pageMap = new Map();
            var self = this;
            let itePageMap = function(pageArray) {
                pageArray.forEach(function(page) {
                    self.pageMap[page.ucKey] = page;
                    if (page.children) {
                        itePageMap(page.children);
                    }
                });
            };
            itePageMap(self.pageArray);
        }

        var fileContent = "";
        let itePageMap = function(pageArray) {
            pageArray.forEach(function(page) {
                if (!page.last) {
                    if (ucFileNameMap[page.ucKey]) {
                        fileContent += ucFileNameMap[page.ucKey];
                    }
                }
                if (page.children) {
                    itePageMap(page.children);
                }
                if (page.last) {
                    if (ucFileNameMap[page.ucKey]) {
                        fileContent += ucFileNameMap[page.ucKey];
                    }
                }
            });
        };
        itePageMap(this.pageArray);
        let wrapperTpl = _.template(fs.readFileSync(path.join(this.tplPath, "wrapper.tpl.js")));
        fs.writeFileSync(path.join(this.ucDistPath, "all.uc.js"), wrapperTpl({
            "body": fileContent,
            "handler": null,
            "relativePath": "../",
            "vtestConfig": this.vtestConfig
        }));
    }

    //处理driver扩展
    let driverStr = this._buildDriver();
    let driverTpl = _.template(fs.readFileSync(path.join(this.tplPath, "vtester-driver.tpl.js")));
    fs.writeFileSync(path.join(this.ucDistPath, "vtester.driver.js"), driverTpl({
        "body": driverStr,
        "vtestConfig": this.vtestConfig
    }));

    //处理route
    let routerTpl = _.template(fs.readFileSync(path.join(this.tplPath, "router.tpl.js")));
    fs.writeFileSync(path.join(this.ucDistPath, "router.js"), routerTpl({}));
};

module.exports = Vtester;
