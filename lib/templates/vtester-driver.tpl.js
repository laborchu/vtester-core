"use strict";
module.exports = function(wd,driver,platform){

    <%methodList.forEach(function(method){%>
    wd.addPromiseChainMethod('<%=method.name%>', <%=method.func%>);
    <%})%>
    

    <%= body %>
}
