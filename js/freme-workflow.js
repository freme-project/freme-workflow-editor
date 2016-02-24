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
};

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

		$("#enrichment-modules").html(html);
	},

	// retrieve input - either from input area or from previous step
	getInput : function() {
		return inputArea.getInput();
	},

	output : function(data) {
//		$("#rdf-1").html(this.nif);

		var rdf = $.rdf().load(data, {});

		var test = rdf
			.prefix("rdf",
				"http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#");
		var d = rdf.databank.dump();
		for (var key in d) {
			if (d.hasOwnProperty(key)) {
				console.log(key);
				console.log(d[key]);
			}
		}
		//console.log(JSON.stringify(rdf.databank.dump()));
		/*console.log(test.size());
		*/
	}
};

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

		$.post(
			fwm.fremeApi + "/e-entity/freme-ner/documents" + variables,
			{"input": input.input},
			function() {},
			'xml')
				.done(function(data) {
					that.output(data);
				})
				.fail(function() { alert("error"); })
				.always(function() {});
	}

};

var test = Object.create(eEntity);
