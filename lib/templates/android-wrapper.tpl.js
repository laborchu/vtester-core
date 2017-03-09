var should = require('should');
var helper = require("<%=relativePath%>helper.uc.js")
<%if (handler) {%>
var handler = require("<%=relativePath%>handler/<%=handlerName%>")
<%}%>
module.exports = function(driver,router){
    <%=body%>
};
