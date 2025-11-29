var docxReader = require("../lib/docx/docx-reader");
var testing = require("../test/testing");
var testData = testing.testData;
var createFakeDocxFile = testing.createFakeDocxFile;

var docxFile = createFakeDocxFile({
    "word/document.xml": testData("simple/word/document.xml")
});

docxReader.read(docxFile).then(function(result) {
    console.log("Result:");
    console.log("Value:", JSON.stringify(result.value, null, 2));
    console.log("Styles in result.value:", result.value.getAllUserStyles());
}).catch(function(error) {
    console.log("Error:", error);
});
