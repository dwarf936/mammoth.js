var documents = require("../lib/documents");
var stylesReader = require("../lib/docx/styles-reader");
var XmlElement = require("../lib/xml").Element;

function createTestStyles() {
    // Create a styles object with some test styles
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
        ]),
        new XmlElement("w:style", {"w:type": "character", "w:styleId": "WarningText"}, [
            new XmlElement("w:name", {"w:val": "风险提示"}, []),
            new XmlElement("w:rPr", {}, [
                new XmlElement("w:sz", {"w:val": "24"}, []), // 12pt
                new XmlElement("w:color", {"w:val": "dddddd"}, []),
                new XmlElement("w:b", {}, [])
            ])
        ])
    ]);
    return stylesReader.readStylesXml(stylesXml);
}

// Create test styles
var styles = createTestStyles();
console.log("Test styles created successfully:", styles);

// Create a document with styles
var document = new documents.Document([], {styles: styles});
console.log("Document created successfully:", document);

// Test getUserStyle
console.log("\nTesting getUserStyle:");
var headingStyle = document.getUserStyle("Heading 1");
console.log("getUserStyle('Heading 1'):", headingStyle);

var headingStyleLower = document.getUserStyle("heading 1");
console.log("getUserStyle('heading 1'):", headingStyleLower);

var warningStyle = document.getUserStyle("风险提示");
console.log("getUserStyle('风险提示'):", warningStyle);

var nonExistentStyle = document.getUserStyle("Non Existent Style");
console.log("getUserStyle('Non Existent Style'):", nonExistentStyle);

// Test getAllUserStyles
console.log("\nTesting getAllUserStyles:");
var allStyles = document.getAllUserStyles();
console.log("getAllUserStyles():", allStyles);
console.log("Number of styles:", Object.keys(allStyles).length);