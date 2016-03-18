/**
 * Created by jonathan(jonathan.sauder@student.hpi.de on 2/25/16.
 */
var xmlToRdf = function(xml) {
	try {
		try {
			return $.rdf().load(xml, {});
		} catch (e) {
			return $.rdf().load(stringToXml(xmlToString(xml).replace(/##XMLLiteral/g, "#XMLLiteral").replace(/\n/g,"")), {});
		}
	} catch (e) {
		e.reason="rdfQuery library error - could not create RDF Graph from response"
		exceptionToDialog(e);
	}
};
var createAnnotations = function(rdf){
	var datadump = rdf.databank.dump();
	const MODE = { UNIQUE : 0, COLLECTION : 1};
	var attr;
	var mode;
	annotations = [];
	for (var annotation in datadump) {
		if (datadump.hasOwnProperty(annotation)) {
			var annoObj = {};
			for (var predicate in datadump[annotation]) {
				if (datadump[annotation].hasOwnProperty(predicate)) {
					if (predicate.match(re("beginIndex"))) {
						annoObj.beginIndex=parseInt(datadump[annotation][predicate][0].value);
						continue;
					} else if (predicate.match(re("endIndex"))) {
						annoObj.endIndex=parseInt(datadump[annotation][predicate][0].value);
						continue;
					}

					mode=MODE.COLLECTION;
					attr="unknown";
					for (var i = 0; i < unique.length; i++) {
						if (predicate.match(re(unique[i]))) {
							attr=unique[i];
							mode=MODE.UNIQUE;
							break;
						}
					}
					if (mode != MODE.UNIQUE) {
						for (i = 0; i < collection.length; i++) {
							if (predicate.match(re(collection[i]))) {
								mode = MODE.COLLECTION;
								attr = collection[i];
								break;
							}
						}
					}

					annoObj[attr] = [];


					for (var value in datadump[annotation][predicate]) {
						if (datadump[annotation][predicate].hasOwnProperty(value)) {

							var val = datadump[annotation][predicate][value].value;

							if (mode === MODE.UNIQUE) {
								annoObj[attr] = val;
							} else if (mode === MODE.COLLECTION) {
								var lang = datadump[annotation][predicate][value].lang;
								if (lang) {
									annoObj.lang=lang;
								}
								annoObj[attr].push({text: val, lang: lang});
							}
							if (predicate.match(re("type")) && val.match(re("Context"))){
								annoObj.context=true;
                                annoObj.hasRelevance=true;
							}
							if (attr!="unknown" && attr != "anchorOf" && attr != "isString"){
								annoObj.hasRelevance=true;
							}
							//		console.log(annotation, "\t\t..."+predicate.substring(predicate.length-10,predicate.length),val.substring(val.length-10, val.length));
						}
					}
				}
			}
		}
		if (annoObj.hasRelevance) {
			annotations.push(annoObj);
		}
	}

	for (i=0; i<annotations.length;i++) {
        if (datadump[annotations[i].taIdentRef]) {
            annotations[i].abstract = datadump[annotations[i].taIdentRef]["http://dbpedia.org/ontology/abstract"][0].value;
			annotations[i].thumbnail = datadump[annotations[i].taIdentRef]["http://dbpedia.org/ontology/thumbnail"][0].value;
        }
	}
	return resolveOffsetConflicts(annotations);
};

const unique= ["anchorOf","abstract","thumbnail","taIdentRef","taConfidence","isString"];
const collection = ["target","taClassRef","new_label","new_uri"];
const specialName = {
	new_label:"Terms",
	new_uri:"Concepts",
	taClassRef:"Entity Classes",
	taIdentRef:"Identifier",
	thumbnail: "Thumbnail"
};
var getName = function(str) {
	return  specialName[str] ? specialName[str] : str
};

var matchAnnotationsToString = function(annotations) {
	/*
	 * Note that the last annotation in the array is always the context!
	 * Matches found annotations to String :
	 * Adds <a href="#" class="tooltip" title="[Annotation - Description]"> [Annotation-Name] </a> in the text correctly
	 */

	var i= 0;
	var a;

	var context= {isString:"",target:[]};
	if (annotations[annotations.length-1].context) {
		context=annotations.pop();
	}

	var str=context.isString;
	while(str[0]=="\""){
		str=str.substring(1,str.length-1);
	}

	var final="";
	for (var k=0; k<annotations.length-1;k++) {
		a=annotations[k];
		final += str.substring(i, a.beginIndex);
		final += generateTooltip(a,str.substring(a.beginIndex, a.endIndex));
		i = a.endIndex;
	}
	final+=str.substring(i);
	final+=generateAppendix(context);


	return final;
};


var resolveOffsetConflicts = function(annotations){
	/*
	 * 1) Sorts array of annotations by their offsets;
	 * 2) Eliminates any ambiguity in offsets and makes sure no annotations overlap each other
	 * NOTE: The last element of the returned array of annotations will always be the context, with beginIndex=0 and endIndex=input.input.length!!!
	*/
	function compareOffset(a,b){
		if (a.context) {
			return -999999;
		}
		if (b.context) {
			return 999999;
		}
		var diff = a.beginIndex-b.beginIndex;
		if (diff === 0) {
			return a.endIndex- b.endIndex;
		}
		return diff;
	}

	annotations.sort(compareOffset);
	var context = annotations[0];
	annotations = annotations.slice(1);
	/*for (var k=0; k<annotations.length; k++ ) {
		console.log(annotations[k].beginIndex, annotations[k].endIndex, context.isString.substring(annotations[k].beginIndex, annotations[k].endIndex));
	}*/
	if (annotations.length>1) {
		for (var k=0; k<annotations.length-1; k++) {
			if (annotations[k].endIndex>=annotations[k+1].beginIndex) {
				if (annotations[k].endIndex==annotations[k+1].endIndex) {
					annotations[k].endIndex=annotations[k+1].beginIndex-1;
				} else {
					annotations[k+1].beginIndex=annotations[k].endIndex+1;
				}
			}
		}
	}
	for (var k=0; k<annotations.length; k++ ) {
		console.log(annotations[k].beginIndex, annotations[k].endIndex, context.isString.substring(annotations[k].beginIndex, annotations[k].endIndex));
	}

	if (debug && annotations.length>1) {
		for (k=0; k<annotations.length-1; k++) {
			if (annotations[k].endIndex>=annotations[k+1].beginIndex) {
				console.log("Warning! Annotation Offsets were not cleanly sorted! " +
					" Annotation: " + annotations[k].name + " endIndex: " + annotations[k].endIndex +
					" Annotation: " + annotations[k+1].name + " beginIndex: "+ annotations[k+1].beginIndex);
			}
		}
	}
	annotations.push(context);
	return annotations;
};

var generateAppendix = function(annotation) {
	/*
	 * Used primarily for generating Human readable text annotation for E-translation service.
	 * Each Translated context will be appended to the enriched text
	 */
	var appendix = "";
	var text;
	if (annotation.target) {
		for (var i = 0; i < annotation.target.length; i++) {
			text = annotation.target[i].text;
			while(text[0]=="\""){
				text=text.substring(1,text.length-1);
			}
			appendix += "<br><br><p><strong>Translation to: " + annotation.target[i].lang + "</strong></p>" + annotation.target[i].text;
		}
	}
	return appendix;
};

var generateTooltip = function(annotation,str) {
	/*
	 * Used for annotating in-text annotations, such as entities.
	 *
	 */
	var hyperlink = annotation["taIdentRef"] ? escapeHtml(annotation["taIdentRef"])+ "\" target=\"_blank" : "#\" onclick=\"return false;";
	var tooltip="<a href=\""+hyperlink+"\" class=\"tooltip\" title=\"";
	for (var i=0; i<unique.length; i++) {

		if (annotation[unique[i]]) {

			if (unique[i]=="thumbnail") {
				tooltip+=escapeHtml("<p><strong>"+getName(unique[i])+" :</strong></p><img height=\"180px\" src=\""+annotation[unique[i]]+"\"/>");
//				tooltip+="&lt;p&gt;&lt;strong&gt;" + escapeHtml(unique[i]) + " : &lt;/strong&gt;"+ annotation[unique + "&lt;/p&gt;"
			} else {
				var text = escapeHtml(annotation[unique[i]]);
				text = text.length > 400 ? text = text.substring(0, 400) + "..." : text;
				tooltip += "&lt;p&gt;&lt;strong&gt;" + escapeHtml(getName(unique[i])) + " : &lt;/strong&gt;" + text + "&lt;/p&gt;";
			}
		}
	}


	for (i=0; i<collection.length; i++) {

		if (annotation[collection[i]]) {
			tooltip+="&lt;p&gt;&lt;strong&gt;"+ getName(collection[i]) +":&lt;/strong&gt; &lt;/p&gt;&lt;ul&gt;";
			for (var item in annotation[collection[i]]) {
				if (annotation[collection[i]].hasOwnProperty(item)) {
					tooltip += "&lt;li&gt;" + annotation[collection[i]][item].text + "&lt;/li&gt;";
				}
			}
			tooltip+="&lt;/ul&gt;";
		}
	}
	return tooltip + "\"> " + str + "</a>";
};


var addTerminologyTermsToRdf = function(rdf,json) {
	var jrb = json.results.bindings;
	for (var i=0;i<jrb.length;i++) {

		var subject = "<http://freme-project.eu/#char="+jrb[i].beginIndex.value+","+jrb[i].endIndex.value+">";

		var objects = jrb[i].new_uri.value.split(/,/g);
		for (var k =0; k<objects.length;k++) {
			rdf.add(
				$.rdf.triple(
					subject,
					"<http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#new_uri>",
					"<"+encodeURI(objects[k].trim())+">"));
		}
		objects = jrb[i].new_label.value.split(/,/g);

		for (k =0; k<objects.length;k++) {
			rdf.add(
				$.rdf.triple(
					subject,
					"<http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#new_label>",

					"<"+encodeURI(objects[k].trim())+">"));
		}
		rdf.add($.rdf.triple(
			subject,
			"<http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#beginIndex>",
			jrb[i].beginIndex.value));

		rdf.add($.rdf.triple(
			subject,
			"<http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#endIndex>",
			jrb[i].endIndex.value));
	}
	return rdf;
};
