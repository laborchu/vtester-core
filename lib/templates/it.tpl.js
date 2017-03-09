<%if(only){%>
it.only('<%=title%>', function() {
	<%=body%>.catch(function(e){
			return driver.saveScreenshot('./out/<%=ucKeyLink%><%=title%>.png').then(()=>{
                throw e;
            });
        });
})
<%}else{%>
it('<%=title%>', function() {
	<%=body%>.catch(function(e){
			return driver.saveScreenshot('./out/<%=ucKeyLink%><%=title%>.png').then(()=>{
                throw e;
            });
        });
})
<%}%>