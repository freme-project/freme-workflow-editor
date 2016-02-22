$(document).ready(function() {

	fwm.addEService("e-entity").doEnrichment();
});

var fwm = {

	eServices : [],
	idCounter : 0,
	fremeApi : "http://api.freme-project.eu/0.5",

	addEService : function(type) {

		var newEService = null;
		if (type == "e-entity") {
			newEService = Object.create(eEntity);
		}

		$.extend(newEService, eService);
		newEService.createId();

		var html = newEService.createHtml();
		this.eServices.push(newEService);
		$("#enrichment-modules").append(html);

		return newEService;
	}
}

var inputArea = {

	getInput : function() {
		return {
			informat : informat = $("input[name=informat]").val(),
			input : input = $("#input-area").html()
		};
	}
}

var eService = {

	// id to identify this eService
	id : 0,

	// initialize unique id
	createId : function() {

		if (typeof eService.idCounter == "undefined") {
			eService.idCounter = 0;
		}

		this.id = ++eService.idCounter;
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
				stepHtml = result;

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

		$("#enrichment-modules").html(html);
	},

	// retrieve input - either from input area or from previous step
	getInput : function() {
		return inputArea.getInput();
	},

	output : function() {

//		$("#rdf-1").html(this.nif);
//		console.log($("#rdf-1").rdf().size());
		
		
		var rdf = $.rdf();
		rdf.databank.load(this.nif);
		console.log(rdf.size());
		var test = rdf
				.prefix("nif",
						"http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#")
				.where("?s nif:isString ?o");
		
		test.each(function(){
			console.log(this.o.value);
		})
		console.log(test.size());

		
		
		// .prefix("nif",
		// "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#").reason("?res
		// nif:isString ?string").each(function(){
		// console.error(this);
		// });
		// console.log(test);
	}
}

var eEntity = {

	createHtml : function() {
		var data = {
			"\\$id\\$" : this.id
		};
		this.loadStep("assets/html/e-entity.html", data);

		var that = this;
		$("#enrich-" + this.id).click(function() {
			that.doEnrichment();
		});
	},

	doEnrichment : function() {
		var input = this.getInput();
		var variables = "?informat=" + input.informat;
		variables += "&outformat=rdf-xml";
		variables += "&dataset=" + $("#dataset-" + this.id).val();
		variables += "&language=" + $("#language-" + this.id).val();
		var that = this;
		$.ajax({
			url : fwm.fremeApi + "/e-entity/freme-ner/documents" + variables,
			data : input.input,
			type : 'POST',
			processData : false,
			dataType: "text",
			contentType: "text/plain",
			success : function(response) {
				that.nif = response;
				that.output();
			}
		});
	}
}

var test = Object.create(eEntity);
