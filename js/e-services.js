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
            success: function(data){processResponse(data,that.id)},
            error: function(data){exceptionToDialog(data)},
            dataType: "xml"
        });
    },
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
            success: function(data){processResponse(data,that.id)},
            error: function(data){exceptionToDialog(data)},
            dataType: "xml"
        });

    },

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
                success: function(data){processResponse(data,that.id)},
                error: function(data){exceptionToDialog(data)},
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
    }

};



