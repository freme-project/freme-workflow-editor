$(document).ready(function() {

	if (debug) {
		console.log("DEBUG!!!")
		fwm.addEService("e-entity").doEnrichment();
	}

	console.log("asdf");
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

		$.extend(newEService, eService);
		newEService.createId();

		var html = newEService.createHtml();
		this.eServices.push(newEService);
		$("#enrichment-modules").append(html);

		return newEService;
	}
};

var inputArea = {

	getInput : function() {
		return {
			informat : informat = $("input[name=informat]").val(),
			input : input = $("#input-area").val()
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

		var rdf = $.rdf().load(data, {});
		var datadump = rdf.databank.dump();
		var mode;
		annotations = [];

		for (var annotation in datadump) {
			if (datadump.hasOwnProperty(annotation)) {
				var annoObj = {};

				for (var predicate in datadump[annotation]) {
					if (datadump[annotation].hasOwnProperty(predicate)) {

						attribute = "undefined";
						mode = "collection";

						if (predicate.match(re("taIdentRef"))) {
							attribute = "identRef";
							mode = "unique";
						} else if (predicate.match(re("taConfidence"))) {
							attribute = "confidence";
							mode = "unique";
						} else if (predicate.match(re("taClassRef"))) {
							attribute = "taClassRef";
							mode = "collection";
						} else if (predicate.match(re("anchorOf"))) {
							attribute = "name";
							mode = "unique";
						} else if (predicate.match(re("beginIndex"))) {
							attribute = "beginIndex";
							mode = "unique";
						} else if (predicate.match(re("endIndex"))) {
							attribute = "endIndex";
							mode = "unique";
						}
						annoObj[attribute] = [];

						for (var value in datadump[annotation][predicate]) {
							if (datadump[annotation][predicate].hasOwnProperty(value)) {

								var val = datadump[annotation][predicate][value].value;
								if (mode === "unique") {
									annoObj[attribute] = val;
								} else if (mode === "collection") {
									annoObj[attribute].push(val);
								}
								//		console.log(annotation, "\t\t..."+predicate.substring(predicate.length-10,predicate.length),val.substring(val.length-10, val.length));
							}
						}
					}
				}
			}
			if (annoObj.name) {
				annoObj.startIndex = parseInt(annoObj.startIndex);
				annoObj.endIndex = parseInt (annoObj.endIndex);
				annotations.push(annoObj);
			}
		}
		var input= $("#input-area").val();
		$("#output-"+this.id).html(matchAnnotationsToString(input,annotations));

		$(".tooltip").tooltipster({contentAsHTML:true});
	}
};


var matchAnnotationsToString = function(str,annotations) {
	/*
	Matches found annotations to String :
	1) Sorts array of annotations by their offsets;
	2) Eliminates any ambiquity in offsets and makes sure no annotations overlap each other
	3) Adds <a href="#" class="tooltip" title="[Annotation - Description]"> [Annotation-Name] </a> in the text correctly
	 */
	function compareOffset(a,b){
		var diff = a.beginIndex-b.beginIndex;
		if (diff === 0) {
			return a.endIndex- b.endIndex;
		}
		return diff;
	}
	annotations.sort(compareOffset);
	if (annotations.length>1) {
		for (var k=0; k<annotations.length-1; k++) {
			if (annotations[k].endIndex>=annotations[k+1].beginIndex) {
				if (annotations[k].endIndex===annotations[k+1].endIndex) {
					annotations[k].endIndex=annotations[k+1].beginIndex-1;
				} else {
					annotations[k+1].beginIndex=annotations[k].endIndex+1;
				}
			}
		}
	}
	if (debug && annotations.length>1) {
		for (var k=0; k<annotations.length-1; k++) {
			if (annotations[k].endIndex>=annotations[k+1].beginIndex) {
				console.log("Warning! Annotation Offsets were not cleanly sorted! " +
					" Annotation: " + annotations[k].name + " endIndex: " + annotations[k].endIndex +
					" Annotation: " + annotations[k+1].name + " beginIndex: "+ annotations[k+1].beginIndex);
			}
		}
	}


	var i= 0;
	var a, tooltip;
	final="";
	for (k=0; k<annotations.length;k++) {
		a=annotations[k];

		tooltip="&lt;p&gt;&lt;strong&gt;"+ a.name + "&lt;/strong&gt;&lt;/p&gt;" +
			"&lt;p&gt;Linked Entity: " + a.identRef + "&lt;/p&gt;"+
			"&lt;p&gt;Entity Classes: &lt;/p&gt;&lt;ul&gt;";
		for (var e in a.taClassRef) {
			tooltip+="&lt;li&gt;" + a.taClassRef[e] + "&lt;/li&gt;";
		}
		tooltip+= "&lt;/ul&gt;&lt;p&gt;Confidence: " + a.confidence + "&lt;/p&gt;";


		final+=str.substring(i,a.beginIndex);
		final+="<a href=\"#\" class=\"tooltip\" title=\""+tooltip+"\"  >"+str.substring(a.beginIndex, a.endIndex) + "</a>";

		i=a.endIndex;
	}
	final+=str.substring(i);
	return final;
};


var re =  function(name){
	return new RegExp("http://.*#"+name);
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
		console.log(input.input);
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

					that.nif=xmlToString(data);
					that.output(data);
				})
				.fail(function() { alert("error"); })
				.always(function() {});
	}
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

