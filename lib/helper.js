'use strict';
var should = require('should');
let fs = require('fs');
let path = require('path');

var buildUcArray = [];
var buildPath;
var buildChecker;
var printInfo = "";
var printUc = function() {
    buildUcArray.forEach(uc => {
        printInfo = printInfo + "=>" + uc.title;
    });
    if (buildPath) {
        printInfo = printInfo + "=>" + buildPath.title;
    }
    if (buildChecker) {
        printInfo = printInfo + "=>" + JSON.stringify(buildChecker);
    }
    console.log(printInfo);
};
module.exports = {
    checkUcFile: function(ucFile) {
        printInfo = ucFile;
    },
    checkUcConfig: function(uc, index) {
        buildUcArray[index] = uc;
        buildUcArray.splice(index + 1);
        buildPath = null;
        buildChecker = null;
        try {
            should(uc).ok();
            should(uc).instanceOf(Object);
            uc.should.have.property('title').instanceOf(String).ok();
            if (uc.hasOwnProperty('build')) {
                should(uc.build).instanceOf(Boolean);
            }
            if (uc.hasOwnProperty('handler')) {
                should(uc.handler).instanceOf(Boolean);
            }
            if (uc.hasOwnProperty('sleep')) {
                should(uc.sleep).instanceOf(Number);
            }
            if (uc.hasOwnProperty('children')) {
                should(uc.children).instanceOf(Array);
            }
            if (uc.hasOwnProperty('ucKey')) {
                should(uc.ucKey).instanceOf(String);
            }
            if (uc.hasOwnProperty('preUc')) {
                should(uc.preUc).instanceOf(String);
            }
            if (uc.hasOwnProperty('paths')) {
                should(uc.paths).instanceOf(Array);
            }
        } catch (e) {
            printUc();
            throw e;
        }
    },
    checkPathConfig: function(pathPlugin, config) {
        try {
            buildPath = config;
            buildChecker = null;
            pathPlugin.checkConfig(config);
        } catch (e) {
            printUc();
            throw e;
        }
    },
    checkCheckerConfig: function(pathPlugin, config) {
        try {
            buildChecker = config;
            pathPlugin.checkConfig(config);
        } catch (e) {
            printUc();
            throw e;
        }
    },
    emptyDir: function(fileUrl) {
        let files = fs.readdirSync(fileUrl); //读取该文件夹
        files.forEach(file => {
            let fullPath = path.join(fileUrl, file);
            let stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                this.emptyDir(fullPath);
                fs.rmdir(fullPath);
            } else {
                fs.unlinkSync(fullPath);
            }
        });
    },
    readFile: function(dir,suffix) {
        var filesArr = [];
        (function readDir(dirpath) {
            var files = fs.readdirSync(dirpath);
            files.forEach(file => {
                let fullPath = path.join(dirpath, file);
                var info = fs.statSync(fullPath);
                if (info.isDirectory()) {
                    readDir(fullPath);
                } else {
                    if (file.endsWith(suffix)) {
                        filesArr.push(fullPath);
                    }
                }
            });
        })(dir);
        return filesArr;
    }
};
