$(document).ready(function() {
	loadExample();

	if (debug) {
		console.log("DEBUG!!!");
		fwm.addEService("e-entity").doEnrichment();
		setTimeout(function() {doPostprocessingFilter()}, 1000);
		/*fwm.addEService("e-translation");
		$("#target-lang-2").val("nl")*/
	}
});

var debug = true;
var fwm = {

	eServices : [],
	idCounter : 0,
	fremeApi : "http://api.freme-project.eu/0.5",

	addEService : function(type) {

		var newEService = null;

		if (type == "e-entity") {
			newEService = Object.create(eEntity);
		}
		else if (type == "e-link") {
			newEService = Object.create(eLink);
		} else if (type == "e-translation") {
			newEService = Object.create(eTranslation);
		} else if (type == "e-terminology") {
			newEService = Object.create(eTerminology);
		}

		$.extend(newEService, eService);
		newEService.createId();

		newEService.createHtml();
		this.eServices.push({type: type, service: newEService});

		return newEService;
	},

	removeEService: function(id) {
		this.eServices[parseInt(id)]={type : "deleted", service: null};
		$("#step"+id).remove();
	}

};

var inputArea = {

	getInput : function() {
		return {
			informat : $("#input-informat").val(),
			input :  $("#input-area").val()
		};
	}
};

var eService = {

	// id to identify this eService
	id : 0,

	// initialize unique id
	createId : function() {

		if (typeof eService.idCounter == "undefined") {
			eService.idCounter = 0;
		}

		this.id = eService.idCounter++;
	},

	// stores the nif of the enrichment when enrichment has been performed. NIF
	// is stored as javascript JSON object
	nif : null,

	// load assets/step.html and assets/e-entity.html and insert the variables
	loadStep : function(url, data) {

		var stepHtml = "";
		jQuery.ajax({
			url : "assets/html/step.html",
			success : function(result) {
				stepHtml = result
			},
			async : false
		});

		var entityHtml = "";

		jQuery.ajax({
			url : url,
			success : function(result) {
				entityHtml = result;

			},
			async : false
		});

		var html = stepHtml.replace(/\$controls\$/g, entityHtml);

		$.each(data, function(key, value) {
			var regex = new RegExp(key, "g");
			html = html.replace(regex, value);
		});
		$("#enrichment-modules").append(html);

	},


	// retrieve input - either from input area or from previous step
	getInput : function() {
		if (this.id==0) {
			return inputArea.getInput();
		}
		var i=0;
		while(fwm.eServices[this.id-1-i].type=="deleted"){
			i+=1
			if (this.id-i==0) {
				return inputArea.getInput();
			}
		}
		return { informat : "application/rdf+xml", input: fwm.eServices[this.id-1-i].nif}
	}
};


var re =  function(name){
	return new RegExp("http://.*#"+name);
};


var xmlToString = function(xmlData) {
	//https://stackoverflow.com/questions/6507293/convert-xml-to-string-with-jquery#6507766
	var xmlString;
	//IE
	if (window.ActiveXObject){
		xmlString = xmlData.xml;
	}
	// code for Mozilla, Firefox, Opera, etc.
	else{
		xmlString = (new XMLSerializer()).serializeToString(xmlData);
	}
	return xmlString;
};


var exceptionToDialog = function(data){
	$("#jquery-ui-dialog").html(data.responseText.replace(/\\\"/g,"''").replace(/\"/g," ").replace(/{/g,"").replace(/}/g,"").replace(/,/g,"<br>"))
	.dialog("open");
};

var processResponse = function(data,id) {
	var service = fwm.eServices[id];
	service.nif = xmlToString(data);
	$("#nif-"+id).html("<pre><code>"+escapeHtml(service.nif)+"</code></pre>");
	service.annotations=createAnnotationsFromXml(data);
	$("#output-"+id).html(matchAnnotationsToString(service.annotations));
	$(".tooltip").tooltipster({contentAsHTML:true,multiple:true});
};


var toggleNif = function(id) {
	var nifdiv = $("#nif-"+id);
	var togglediv = $("#toggle-"+id);
	if (togglediv.text()=="[Show NIF]") {
		nifdiv.show();
		togglediv.text("[Hide NIF]")
	} else if (togglediv.text()=="[Hide NIF]") {
        nifdiv.hide();
		togglediv.text("[Show NIF]")
	}
}


var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

function escapeHtml(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}

function jsonToTable(json) {
	var li="<table><tr>";
	var cols=json.head.vars.length;
	var val;
	for (var i=0; i<cols;i++) {
		li+="<th>"+json.head.vars[i]+"</th>"
	}
	li+="</tr>";

	for(i=0; i<json.results.bindings.length;i++) {
		li+="<tr>"
		for (var k=0; k<cols;k++) {
			val = json.results.bindings[i][json.head.vars[k]];
			if (val) {
				li += "<td>" + val.value + "</td>";

			}
		}
		li+="</tr>";
	}

	return li+"</table>";
}