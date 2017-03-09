<%if (isTopUc) {%>
    if(driver.preLastUcKey==null||driver.preLastUcKey=="<%=ucKey%>"){
        driver.preLastUcKey = null;
        describe<%if(only){%>.only<%}%>('<%=title%>', function() {
            it('路由',function(){
                helper.describeStart&&helper.describeStart("<%=ucKey%>");
                return router(driver,"<%=winName%>");
            });
            <%=body%>
        })
    }
<%}else{%>
    describe<%if(only){%>.only<%}%>('<%=title%>', function() {
        <%=body%>
    })
    <%}%>
