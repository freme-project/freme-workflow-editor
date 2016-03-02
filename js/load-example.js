/**
 * Created by jonathan (jonathan.sauder@student.hpi.de) on 2/26/16.
 */
var exampleTextHolder = {
    html :
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "<head></head>\n" +
    "<body>\n" +
    "<p>" +
    "Cheddar is the most popular type of cheese in the United Kingdom, accounting for 51% of the country's £1.9 billion annual cheese market. It is also the second most popular cheese in the US (behind mozzarella), with an average annual consumption of 10 lb (4.5 kg) per capita. The United States produced approximately 3,000,000,000 lb (1,300,000 long tons; 1,400,000 tonnes) in 2014,[4] and theUnited Kingdom 258,000 long tons (262,000 tonnes) in 2008. " +
    "</p>\n" +
    "<p>" +
    "The term \"Cheddar cheese\" is widely used, but has no Protected Designation of Origin within the European Union, although only Cheddar produced from local milk within four counties of south west England may use the name \"West Country Farmhouse Cheddar\"." +
    "</p>\n" +
    "</body>\n" +
    "</html>\n",

    turtle : "@prefix dbpedia-fr: <http://fr.dbpedia.org/resource/> ." +
    "    @prefix dbc:   <http://dbpedia.org/resource/Category:> ." +
    "    @prefix dbpedia-es: <http://es.dbpedia.org/resource/> ." +
    "    @prefix xsd:   <http://www.w3.org/2001/XMLSchema#> ." +
    "    @prefix nif:   <http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#> ." +
    "    <http://freme-project.eu/#char=0,741>" +
    "    a               nif:String , nif:Context , nif:RFC5147String ;" +
    "nif:beginIndex  \"0\"^^xsd:int ;" +
    "nif:endIndex    \"741\"^^xsd:int ;" +
    "nif:isString    \"The Nibelungenlied, " +
    "translated as The Song of the Nibelungs, is an epic poem in Middle High German. " +
    "The story tells of dragon-slayer Siegfried at the court of the Burgundians, " +
    "how he was murdered, and of his wife Kriemhild's revenge.The Nibelungenlied " +
    "is based on pre-Christian Germanic heroic motifs (the Nibelungensaga), which" +
    " include oral traditions and reports based on historic events and individuals of the" +
    " 5th and 6th centuries. Old Norse parallels of the legend survive in the Völsunga saga," +
    " the Prose Edda, the Poetic Edda, the Legend of Norna-Gest, and the Þiðrekssaga.In" +
    " 2009, the three main manuscripts of the Nibelungenlied were inscribed in UNESCO's Memory " +
    "of the World Register in recognition of their historical significance.\"^^xsd:string .",




    xliff : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
    "<?xml-stylesheet type=\"text/xsl\"?>\n" +
    "<xliff xmlns:dl=\"http://www.digitallinguistics.com\" xmlns=\"urn:oasis:names:tc:xliff:document:1.2\" xmlns:its=\"http://www.w3.org/2005/11/its\" version=\"1.2\">\n" +
    "<file original=\"PCWorldArticle.txt\" source-language=\"en\" target-language=\"de\" datatype=\"plaintext\"> \n" +
    "<body> \n" +
    "<trans-unit xmlns:its=\"http://www.w3.org/2005/11/its\" id=\"0\" its:version=\"2.0\">\n" +
    "<source>Southern France or the south of France, colloquially known as le Midi, is a defined geographical area consisting of the regions of France that border the Atlantic Ocean south of the Marais Poitevin, Spain, the Mediterranean, and Italy.</source>" +
    "</trans-unit>\n" +
    "</body>\n" +
    "</file>\n" +
    "</xliff>",

    text: "Berlin is the capital of Germany and one of the 16 states of Germany. With a population of 3.5 million people, it is the second most populous city proper and the seventh most populous urban area in the European Union. Located in northeastern Germany on the banks of Rivers Spree and Havel, it is the center of the Berlin-Brandenburg Metropolitan Region, which has about six million residents from over 180 nations. Due to its location in the European Plain, Berlin is influenced by a temperate seasonal climate. Around one-third of the city's area is composed of forests, parks, gardens, rivers and lakes."
};
var loadExample = function(){
    var choice = $("#loadExampleChoice").val();
    var text;
    switch(choice){
        case "text/plain": text=exampleTextHolder.text;
            break;
        case "application/x-xliff+xml":text=exampleTextHolder.xliff;
            break;
        case "text/html":text=exampleTextHolder.html;
            break
        case "text/turtle":text=exampleTextHolder.turtle;
    }
    var area= $("#input-area");
    area.val("");
    area.val(text);
    $("#input-informat").val(choice);

};


