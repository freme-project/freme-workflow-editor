/**
 * Created by jonathan (jonathan.sauder@student.hpi.de) on 2/25/16.
 */

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

        var variables = "?informat=" + encodeURIComponent(input.informat);
        variables += "&outformat=rdf-xml";
        variables += "&dataset=" + $("#dataset-" + this.id).val();
        variables += "&language=" + $("#language-" + this.id).val();
        variables += "&mode=" + $("#mode-" + this.id).val();
        var that = this;
        $.ajax({
            type:"POST",
            url:fwm.fremeApi + "/e-entity/freme-ner/documents" +variables,
            data: input.input,//{input:   input.input,//},
            contentType: input.informat,
            success: function(data){processXmlResponse(data,that.id)},
            error: function(data){responseToDialog(data)},
            dataType: "xml"
        });
    }
};


var eLink = {
    createHtml : function() {
        var data = {
            "\\$id\\$" : this.id
        };
        this.loadStep("assets/html/e-link.html", data);

        var that = this;
        $("#enrich-" + this.id).click(function() {
            that.doEnrichment();
        });
    },

    doEnrichment : function() {
        var input = this.getInput();
        var variables = "?informat=" + encodeURIComponent(input.informat);
        variables += "&outformat=rdf-xml";
        variables += "&templateid=" + $("#template-" + this.id).val();
        var that = this;
        $.ajax({
            type:"POST",
            url:fwm.fremeApi + "/e-link/documents" +variables,
            data: input.input,//{input:   input.input,//},
            contentType: input.informat,
            success: function(data){processXmlResponse(data,that.id)},
            error: function(data){responseToDialog(data)},
            dataType: "xml"
        });

    }

};
var eTranslation = {
    createHtml : function() {
        var data = {
            "\\$id\\$" : this.id
        };
        this.loadStep("assets/html/e-translation.html", data);

        var that = this;
        $("#enrich-" + this.id).click(function() {
            that.doEnrichment();
        });
    },

    doEnrichment : function() {
        var input = this.getInput();
        var variables = "?informat=" + encodeURIComponent(input.informat);
        variables += "&outformat=rdf-xml";
        variables += "&source-lang=" + $("#source-lang-" + this.id).val();
        variables += "&target-lang=" + $("#target-lang-" + this.id).val();
        var that = this;

        $.ajax({
                type:"POST",
                url:fwm.fremeApi + "/e-translation/tilde" +variables,
                data: input.input,//,{input: input.input},
                contentType: input.informat,
                success: function(data){processXmlResponse(data,that.id)},
                error: function(data){responseToDialog(data)},
                dataType: "xml"
            });
    }
};

var eTerminology = {

    createHtml : function() {
        var data = {
            "\\$id\\$" : this.id
        };
        this.loadStep("assets/html/e-terminology.html", data);

        var that = this;
        $("#enrich-" + this.id).click(function() {
            that.doEnrichment();
        });

    },

    doEnrichment : function() {

        var variables;
        var input = this.getInput();
        var that = this;
        var rdf;

        variables = "?informat=" + encodeURIComponent(input.informat);
        variables += "&outformat=json&filter=freme-workflow-editor-terminology";
        variables += "&source-lang=" + $("#source-lang-" + this.id).val();
        variables += "&target-lang=" + $("#target-lang-" + this.id).val();

        $.ajax({
            type:"POST",
            url:fwm.fremeApi + "/e-terminology/tilde" +variables,
            data: input.input,//,{input: input.input},
            contentType: input.informat,
            success: function(data) {
                var xml= stringToXml(input.input);
                if (that.id!=0) {
                    var rdfData = xmlToRdf(xml);
                    rdfData = addTerminologyTermsToRdf(rdfData, data);
                    processXmlResponse( rdfData.databank.dump({format :"application/rdf+xml"}), that.id,rdfData );
                } else {
                    getContextFromEEntity(that,input,data);
                }
            },
            error: function(data){responseToDialog(data)}
//            dataType: "csv"
        });
    }

};



var doPostprocessingFilter = function() {
    var input = fwm.eServices[fwm.eServices.length-1].nif;
    var filtername=  $("#filter-name").val();
    var variables = filtername+ "?informat=rdf-xml";
    variables += "&outformat=json";
    $.ajax({
        type:"POST",
        url:fwm.fremeApi + "/toolbox/convert/documents/" +variables,
        data: input,
        contentType: "application/rdf+xml",
        success: function(data){$("#filtered").html(jsonToTable(data));$("#filter-header").html("<strong>FILTER: "+filtername.toUpperCase()+"</strong>")},
        error: function(data){responseToDialog(data)}
       // dataType: "csv"
    });
};




var getContextFromEEntity = function(that,input,response) {
    var rdf, rdfData;

    var url = fwm.fremeApi + "/e-entity/freme-ner/documents?informat=" + encodeURIComponent(input.informat) + "&outformat=rdf-xml&dataset=dbpedia&language=en";
    return $.ajax({
        type: "POST",
        url: url,
        data: input.input,//{input:   input.input,//},
        contentType: input.informat,
        success: function (data) {
            rdf = xmlToRdf(data)
                .prefix("nif", "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#")
                .where("?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> nif:Context")
                .where("?x nif:isString ?p")
                .where("?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?t");
            rdfData = $.rdf().load(rdf.dump());
            rdfData = addTerminologyTermsToRdf(rdfData, response);
            processXmlResponse(rdfData.databank.dump({format: "application/rdf+xml"}), that.id, rdfData);
        },
        error: function (data) {
            responseToDialog(data)
        },
        dataType: "xml"
    })
};


