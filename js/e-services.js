/**
 * Created by jonathan (jonathan.sauder@student.hpi.de) on 2/25/16.
 */

var eEntity = {

    unique : ["anchorOf","taIdentRef","taConfidence","isString"],
    collection :["target","taClassRef"],

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
        variables += "&mode=" + $("#mode-" + this.id).val();
        var that = this;

        $.post(
                fwm.fremeApi + "/e-entity/freme-ner/documents" + variables,
            {"input": input.input},
            function() {},
            'xml')
            .done(function(data) {

                fwm.eServices[that.id].nif=xmlToString(data);
                fwm.eServices[that.id].annotations=createAnnotationsFromXml(data,eEntity.unique,eEntity.collection);
                fwm.eServices[that.id].display=matchAnnotationsToString(
                    input.input,
                    fwm.eServices[that.id].annotations.slice(0,-1),
                    that.generateTooltipText,that.id);

                $("#output-"+that.id).html(fwm.eServices[that.id].display);
                $(".tooltip").tooltipster({contentAsHTML:true});





            })
            .fail(function() { alert("error"); })
            .always(function() {});
    },


    generateTooltipText : function(annotation,str,id) {
        var tooltip="<a href=\"#\" class=\"tooltip\" title=\"";
        for (var i=0; i<eEntity.unique.length; i++) {

            if (annotation[eEntity.unique[i]]) {
                tooltip+="&lt;p&gt;&lt;strong&gt;" + eEntity.unique[i] + " : &lt;/strong&gt;"+ annotation[eEntity.unique[i]] + "&lt;/p&gt;";
            }
        }

       for (i=0; i<eEntity.collection.length; i++) {

           if (annotation[eEntity.collection[i]]) {
               tooltip+="&lt;p&gt;&lt;strong&gt;"+ eEntity.collection[i] +":&lt;/strong&gt; &lt;/p&gt;&lt;ul&gt;";
               for (var item in annotation[eEntity.collection[i]]) {
                   if (annotation[eEntity.collection[i]].hasOwnProperty(item)) {
                       tooltip += "&lt;li&gt;" + annotation[eEntity.collection[i]][item] + "&lt;/li&gt;";
                   }
               }
               tooltip+="&lt;/ul&gt;";
           }
       }
        return {tooltip : tooltip + "\"> " + str + "</a>" , appendix : ""} ;
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
    },

    generateTooltipText : function(annotation,str) {
        return "";
    }
};
var eTranslation = {


    unique: ["isString"],
    collection: ["target"],

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
        var variables = "?informat=" + input.informat;
        variables += "&outformat=rdf-xml";
        variables += "&source-lang=" + $("#source-lang-" + this.id).val();
        variables += "&target-lang=" + $("#target-lang-" + this.id).val();
        var that = this;

        $.post(
                fwm.fremeApi + "/e-translation/tilde" + variables,
            {"input": input.input},
            function() {},
            'xml')
            .done(function(data) {



                fwm.eServices[that.id].nif=xmlToString(data);
                fwm.eServices[that.id].annotations=createAnnotationsFromXml(data,eTranslation.unique,eTranslation.collection);
                fwm.eServices[that.id].display=matchAnnotationsToString(
                    input.input,
                    fwm.eServices[that.id].annotations,
                    that.generateTooltipText,that.id);

                $("#output-"+that.id).html(fwm.eServices[that.id].display);
                $(".tooltip").tooltipster({contentAsHTML:true});

            })
            .fail(function(data) { alert("asdf"+ JSON.parse(data)); })
            .always(function() {});
    },

    generateTooltipText : function(annotation,str,id) {
        var appendix="";
        for (var i =0; i<annotation.target.length; i++ ) {
            appendix+="<br><br><strong>Translation to:</strong><p>" +  $("#target-lang-" + id).val()+ "</p>" +  annotation.target[i];
        }
        return {tooltip : str, appendix : appendix} ;
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
    },

    generateTooltipText : function(annotation) {
        return "";
    }
};

var holdid;

