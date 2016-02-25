/**
 * Created by jonathan (jonathan.sauder@student.hpi.de) on 2/25/16.
 */

var eEntity = {

    unique : ["anchorOf","taIdentRef","taConfidence"],
    collection :["taClassRef"],

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

                that.nif=xmlToString(data);
                var annotations = createAnnotationsFromXml(data,eEntity.unique,eEntity.collection);
                var input= $("#input-area").val();
                $("#output-"+that.id).html(matchAnnotationsToString(input,annotations,that.generateTooltipText));
                $(".tooltip").tooltipster({contentAsHTML:true});

            })
            .fail(function() { alert("error"); })
            .always(function() {});
    },


    generateTooltipText : function(annotation) {
        var tooltip="";
        for (var i=0; i<eEntity.unique.length; i++) {
            if (annotation[eEntity.unique[i]]) {
                tooltip+="&lt;p&gt;&lt;strong&gt;" + annotation[eEntity.unique[i]] + "&lt;/strong&gt;&lt;/p&gt;";
            }
        }

       for (i=0; i<eEntity.collection.length; i++) {
           if (annotation[eEntity.collection[i]].length!=0) {
                tooltip+="&lt;ul&gt;";
               for (var item in annotation[eEntity.collection[i]]) {
                   if (annotation[eEntity.collection[i]].hasOwnProperty(item)) {
                       tooltip += "&lt;li&gt;" + annotation[eEntity.collection[i]][item] + "&lt;/li&gt;";
                   }
               }
               tooltip+="&lt;/ul&gt;";
           }
       }
        return tooltip;
    }
};