"use strict";
let _ = require('lodash');
let pageObj = require("../page.map.js");
let pageArrayObj = pageObj.pageTree;
pageArrayObj = _.cloneDeep(pageArrayObj);
let pageMap = new Map();
let itePageMap = function(pageArray){
    pageArray.forEach(function(page){
        pageMap[page.ucKey] = page;
        if(page.children){
            itePageMap(page.children);
        }
    });
};
itePageMap(pageArrayObj);

var winNameLinkArray = [];
var curLink = [];
//第一次设置权重
let setPageWeight = function(pageArray){
    pageArray.forEach(function(page){
        curLink.push(page.ucKey);
        let hasChildren = false;
        if(page.children&&page.children.length>0){
            hasChildren = true;
            setPageWeight(page.children);
        }
        let hasGoto = false;
        if(page.goto&&page.goto.length>0){
            hasGoto = true;
            var pageGotoArray = [];
            page.goto.forEach(function(ucKey){
                if(pageMap[ucKey]){
                    pageGotoArray.push(pageMap[ucKey]);
                }
            });
            setPageWeight(pageGotoArray);
        }
        if(!hasChildren&&!hasGoto){
            winNameLinkArray.push(_.cloneDeep(curLink));
        }
        curLink.pop();
    });
};
setPageWeight(pageArrayObj);
let pathArray = [];
winNameLinkArray.forEach(function(link){
    pathArray.push("-"+link.join("-")+"-");
});

let getPath = function(fromWin,toWin){
    let fromPathArray = [];
    let toPathArray = [];
    pathArray.forEach(function(path){
        if(path.indexOf(fromWin) !== -1){
            fromPathArray.push(path);
        }
        if(path.indexOf(toWin) !== -1){
            toPathArray.push(path);
        }
    });
    var minMoveObj = {
        moveCount:0,
        goPath:[]
    };
    //console.log(fromPathArray);
    //console.log(toPathArray);
    fromPathArray.forEach(function(fromPath){
        let fromWinArray = fromPath.split("-").filter(Boolean);
        toPathArray.forEach(function(toPath){
            let toWinArray = toPath.split("-").filter(Boolean);
            let size = (fromWinArray.length>=toWinArray.length)?toWinArray.length:fromWinArray.length;
            let sameCount = 0;
            for (let i = 0; i < size; i++) {
                if(fromWinArray[i]==toWinArray[i]){
                    sameCount++;
                    if(fromWinArray[i]==fromWin||toWinArray[i]==toWin){
                        break;
                    }
                }else{
                    break;
                }
            }
            if(sameCount===0){
                return;
            }
            //处理返回路径
            let backCount = 0;
            let backPath = [];
            if(fromWinArray[sameCount-1]!=fromWin){//判断是否需要回调,当toWin在fromWin后面路径的时候不需要回跳
                backCount = 1;
                let preWin = fromWinArray[sameCount-1];
                for (let i = sameCount; i < fromWinArray.length; i++) {
                    backPath.push(fromWinArray[i]+"->"+preWin);
                    if(fromWinArray[i]!=fromWin){
                        backCount++;
                    }else{
                        break;
                    }
                }
            }

            //处理前进路径
            let goCount = 0;
            let goPath = [];
            if(toWinArray[sameCount-1]!=toWin){//判断是否需要前进,当toWin在fromWin前面路径的时候不需要前进
                goCount = 1;
                let preWin = toWinArray[sameCount-1];
                for (let i = sameCount; i < toWinArray.length; i++) {
                    goPath.push(preWin+"->"+toWinArray[i]);
                    preWin = toWinArray[i];
                    if(toWinArray[i]!=toWin){
                        goCount++;
                    }else{
                        break;
                    }
                }
            }
            if((backCount+goCount)>minMoveObj.moveCount){
                minMoveObj.backCount = backCount;
                minMoveObj.goPath = goPath;
                minMoveObj.backPath = backPath;
            }
        });
    });
    return minMoveObj;
};
//let minMoveObj = getPath("ChatFragment","F_RS");
//for (var i = 0; i < minMoveObj.backCount; i++) {
//    console.log("back");
//}
//minMoveObj.goPath.forEach(function(path){
//    console.log(path);
//});

let runBack = function(promise,count,backPath){
    if(count===0){
        return promise;
    }else{
        let path = backPath[backPath.length-count];
        count--;
        if(promise[path]){
            return runBack(promise[path](),count,backPath);
        }else{
            return runBack(promise.customBack(),count,backPath);
        }
    }
};
let runGo = function(promise,goPath){
    if(goPath.length===0){
        return promise;
    }else{
        let path = goPath.shift();
        if(!promise[path]){
            throw new Error('route '+path+' is not set');
        }
        return runGo(promise[path](),goPath);
    }
};
module.exports = function (driver,toWin) {
    return driver.sleep(2000).getContentDesc().then(function(desc){
        let fromWin = desc.actName;
        if(toWin==fromWin){
            return driver;
        }else{
            let minMoveObj = getPath(fromWin,toWin);
            var promise = runBack(driver,minMoveObj.backCount,minMoveObj.backPath);
            return runGo(promise,minMoveObj.goPath);
        }
    });
};
