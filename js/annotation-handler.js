/**
 * Created by jonathan(jonathan.sauder@student.hpi.de on 2/25/16.
 */
var createAnnotationsFromXml = function(xmlResponse,unique,collection){
	var rdf = $.rdf().load(xmlResponse, {});
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
								annoObj[attr].push(val);
							}
							if (predicate.match(re("type")) && val.match(re("Context"))){
								annoObj.context=true;
                                annoObj.hasRelevance=true;
							}
							if (attr!="unknown"){
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
	return resolveOffsetConflicts(annotations);
};

var matchAnnotationsToString = function(str,annotations,generateTooltip,id) {
	/*
	 * Matches found annotations to String :
	 * Adds <a href="#" class="tooltip" title="[Annotation - Description]"> [Annotation-Name] </a> in the text correctly
	 */

	var i= 0;
	var a;

	var final="";
	var appendix= "";
	var tooltipObj = {};
	for (k=0; k<annotations.length;k++) {
		a=annotations[k];
		tooltipObj= generateTooltip(a, str. substring(a.beginIndex, a.endIndex),id);
		if (!a.context) {
			final += str.substring(i, a.beginIndex);
			final += tooltipObj.tooltip;
			i = a.endIndex;
		}

		appendix += tooltipObj.appendix;
	}
	final+=str.substring(i);
	final+= appendix;


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
			return -9999;
		}
		if (b.context) {
			return 9999;
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
	annotations.push(context);
	return annotations;
};

