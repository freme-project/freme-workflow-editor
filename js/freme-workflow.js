$(document).ready(function() {
	loadExample();

	if (debug) {
		console.log("DEBUG!!!");
		loadExample();
		fwm.addEService("e-translation").doEnrichment();
		setTimeout(function(){fwm.addEService("e-translation").doEnrichment()},3500);
		/*setTimeout(function(){fwm.addEService("e-entity").doEnrichment()},4000);*/
	}

});

var debug = false;
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
		console.log("step"+id);

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
		return { informat : "rdf-xml", input: fwm.eServices[this.id-1].nif};
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

var processResponse = function(input,data,id,type) {
	var service = fwm.eServices[id];
	service.nif=xmlToString(data);
	service.input=input;
	service.annotations=createAnnotationsFromXml(data,type.unique,type.collection);
	service.display=matchAnnotationsToString(
		service.input.input,
		service.annotations,
		type.generateTooltipText,id);
	$("#output-"+id).html(service.display);
	$(".tooltip").tooltipster({contentAsHTML:true,multiple:true});
};



