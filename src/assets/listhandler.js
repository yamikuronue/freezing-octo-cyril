$( document ).ready(function() {
    $("li.listitem .complete").click(completeItem);

    $("#addItemForm").ajaxForm(function() {
		$( "#addSuccess" ).slideDown();
		setTimeout(function(){ $( "#addSuccess" ).slideUp(); }, 3000);
		refreshList();
	}); 
});

function refreshList() {
	$.ajax({
		url: document.URL,    
		headers: {
			Accept : "application/json; charset=utf-8" 
		},
		success : function(response) {
			var source   = $("#itemTemplate").html();
			var template = Handlebars.compile(source);

			var html = template(response);
			$("#itemsList").html(html);
			$("li.listitem .complete").click(completeItem);
		} 
	});
};
function completeItem(eventObject) {
	var id = $(eventObject.target).parent().attr("id");
	$.ajax({
		url: "/item/" + id + "/complete",
		headers: {
			Accept : "application/json; charset=utf-8" 
		},
		context: document.body
	}).done(function() {
		$( "#completeSuccess" ).slideDown();
		setTimeout(function(){ $( "#completeSuccess" ).slideUp(); }, 3000);
		refreshList();
	});
}