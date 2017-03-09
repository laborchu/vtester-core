'use strict';
var Path = require('../path');
module.exports = Path.extend({
  getTemplate:function(config){
    if(config.op=="del"){
      return '.safeEval("var ztree =  jQuery.fn.zTree.getZTreeObj(\'<%= ztreeId %>\'); var node = ztree.getNodeByTId(\'<%= nodeId %>\');ztree.removeNode(node);")';
    }else if(config.op=="input"){
      return '.safeEval("var ztree =  jQuery.fn.zTree.getZTreeObj(\'<%= ztreeId %>\'); var node = ztree.getNodeByTId(\'<%= nodeId %>\');node.name = \'<%= value %>\';ztree.updateNode(node);")';
    }
  },
  buildParams:function(config) {
    if (config.op == "del") {
      return {'ztreeId': config.ztreeId, 'nodeId': config.nodeId};
    } else if (config.op == "input") {
      return {'ztreeId': config.ztreeId, 'nodeId': config.nodeId,value: config.value};
    }
  }
});
