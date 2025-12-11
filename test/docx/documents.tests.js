var assert = require("assert");
var documents = require("../../lib/documents");
var stylesReader = require("../../lib/docx/styles-reader");
var XmlElement = require("../../lib/xml").Element;
var test = require("../test")(module);

test('getUserStyle returns correct style properties', function() {
    var styles = createTestStyles();
    var document = new documents.Document([], {styles: styles});
    
    var warningStyle = document.getUserStyle("风险提示");
    assert.equal(warningStyle.fontSize, 12);
    assert.equal(warningStyle.color, "dddddd");
    assert.equal(warningStyle.isBold, true);
    assert.equal(warningStyle.isItalic, false);
    assert.equal(warningStyle.font, undefined); // Not set in this style
    assert.equal(warningStyle.alignment, undefined); // Character style doesn't have paragraph properties
});

test('getUserStyle returns null if style not found', function() {
    var styles = createTestStyles();
    var document = new documents.Document([], {styles: styles});
    
    var missingStyle = document.getUserStyle("不存在的样式");
    assert.equal(missingStyle, null);
});

test('getUserStyle is case-insensitive', function() {
    var styles = createTestStyles();
    var document = new documents.Document([], {styles: styles});
    
    var headingStyle = document.getUserStyle("heading 1");
    assert.equal(headingStyle.fontSize, 16);
    assert.equal(headingStyle.isBold, true);
});

test('getAllUserStyles returns all styles', function() {
    var styles = createTestStyles();
    var document = new documents.Document([], {styles: styles});
    
    var allStyles = document.getAllUserStyles();
    assert.equal(Object.keys(allStyles).length, 2);
    assert.equal(allStyles["heading 1"].fontSize, 16);
    assert.equal(allStyles["风险提示"].color, "dddddd");
});

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
