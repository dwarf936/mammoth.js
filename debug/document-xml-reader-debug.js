var documentXmlReader = require("../lib/docx/document-xml-reader");
var XmlElement = require("../lib/xml").Element;

// Create a simple test XML
var testXml = new XmlElement("w:document", {}, [
    new XmlElement("w:body", {}, [
        new XmlElement("w:p", {}, [
            new XmlElement("w:pPr", {}, [
                new XmlElement("w:pStyle", {"w:val": "Heading1"}, [])
            ]),
            new XmlElement("w:r", {}, [
                new XmlElement("w:t", {}, ["Hello, World!"])
            ])
        ])
    ])
]);

// Create styles
var stylesXml = new XmlElement("w:styles", {}, [
    new XmlElement("w:style", {"w:type": "paragraph", "w:styleId": "Heading1"}, [
        new XmlElement("w:name", {"w:val": "Heading 1"}, []),
        new XmlElement("w:rPr", {}, [
            new XmlElement("w:sz", {"w:val": "32"}, []),
            new XmlElement("w:b", {}, []),
            new XmlElement("w:color", {"w:val": "FF0000"}, []),
            new XmlElement("w:rFonts", {"w:ascii": "Arial"}, [])
        ]),
        new XmlElement("w:pPr", {}, [
            new XmlElement("w:jc", {"w:val": "center"}, [])
        ])
    ])
]);

var stylesReader = require("../lib/docx/styles-reader");
var styles = stylesReader.readStylesXml(stylesXml);

// Test the reader with styles
var bodyReader = require("../lib/docx/body-reader").createBodyReader({styles: styles});
var reader = new documentXmlReader.DocumentXmlReader({bodyReader: bodyReader, styles: styles});
var result = reader.convertXmlToDocument(testXml);

console.log("DocumentXmlReader result:");
console.log(JSON.stringify(result, null, 2));

// Test document methods
console.log("\nTesting document methods:");
console.log("getUserStyle('Heading 1'):", result.document.getUserStyle("Heading 1"));
console.log("getUserStyle('heading 1'):", result.document.getUserStyle("heading 1"));
console.log("getAllUserStyles():", result.document.getAllUserStyles());
