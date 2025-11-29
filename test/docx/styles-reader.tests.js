var assert = require("assert");

var readStylesXml = require("../../lib/docx/styles-reader").readStylesXml;
var XmlElement = require("../../lib/xml").Element;
var test = require("../test")(module);


test('paragraph style is null if no style with that ID exists', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [])
    );
    assert.equal(styles.findParagraphStyleById("Heading1"), null);
});

test('paragraph style can be found by ID', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            paragraphStyleElement("Heading1", "Heading 1")
        ])
    );
    assert.equal(styles.findParagraphStyleById("Heading1").styleId, "Heading1");
});

test('table style can be found by ID', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            tableStyleElement("TableNormal", "Normal Table")
        ])
    );
    assert.equal(styles.findTableStyleById("TableNormal").styleId, "TableNormal");
});

test('character style can be found by ID', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            characterStyleElement("Heading1Char", "Heading 1 Char")
        ])
    );
    assert.equal(styles.findCharacterStyleById("Heading1Char").styleId, "Heading1Char");
});

test('paragraph and character styles are distinct', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            paragraphStyleElement("Heading1", "Heading 1"),
            characterStyleElement("Heading1Char", "Heading 1 Char")
        ])
    );
    assert.equal(styles.findCharacterStyleById("Heading1"), null);
    assert.equal(styles.findParagraphStyleById("Heading1Char"), null);
});

test('character and table styles are distinct', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            tableStyleElement("Heading1", "Heading 1")
        ])
    );
    assert.equal(styles.findCharacterStyleById("Heading1"), null);
});

test('styles include names', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            paragraphStyleElement("Heading1", "Heading 1")
        ])
    );
    assert.equal(styles.findParagraphStyleById("Heading1").name, "Heading 1");
});

test('style name is null if w:name element does not exist', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            styleWithoutWNameElement("paragraph", "Heading1"),
            styleWithoutWNameElement("character", "Heading1Char")
        ])
    );
    assert.equal(styles.findParagraphStyleById("Heading1").name, null);
    assert.equal(styles.findCharacterStyleById("Heading1Char").name, null);
});

test('numbering style is null if no style with that ID exists', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [])
    );
    assert.equal(styles.findNumberingStyleById("List1"), null);
});

test('numbering style has null numId if style has no paragraph properties', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            new XmlElement("w:style", {"w:type": "numbering", "w:styleId": "List1"})
        ])
    );
    assert.equal(styles.findNumberingStyleById("List1").numId, null);
});

test('numbering style has numId read from paragraph properties', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            new XmlElement("w:style", {"w:type": "numbering", "w:styleId": "List1"}, [
                new XmlElement("w:pPr", {}, [
                    new XmlElement("w:numPr", {}, [
                        new XmlElement("w:numId", {"w:val": "42"})
                    ])
                ])
            ])
        ])
    );
    assert.equal(styles.findNumberingStyleById("List1").numId, "42");
});

test('when multiple style elements have same style ID then only first element is used', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            tableStyleElement("TableNormal", "Normal Table"),
            tableStyleElement("TableNormal", "Table Normal")
        ])
    );
    assert.equal(styles.findTableStyleById("TableNormal").name, "Normal Table");
});

test('style properties are read correctly', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            styleElementWithProperties("paragraph", "Heading1", "Heading 1", {
                runProperties: {
                    fontSize: "32",
                    isBold: true,
                    isItalic: false,
                    color: "FF0000",
                    font: "Arial"
                },
                paragraphProperties: {
                    alignment: "center"
                }
            })
        ])
    );
    
    var heading1Style = styles.findParagraphStyleById("Heading1");
    assert.equal(heading1Style.properties.fontSize, 16); // 32 half-points = 16 points
    assert.equal(heading1Style.properties.isBold, true);
    assert.equal(heading1Style.properties.isItalic, false);
    assert.equal(heading1Style.properties.color, "FF0000");
    assert.equal(heading1Style.properties.font, "Arial");
    assert.equal(heading1Style.properties.alignment, "center");
});

test('style can be found by name', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            styleElementWithProperties("paragraph", "Heading1", "Heading 1", {
                runProperties: {
                    fontSize: "32",
                    isBold: true
                }
            }),
            styleElementWithProperties("character", "WarningText", "Warning Text", {
                runProperties: {
                    color: "FF0000",
                    isItalic: true
                }
            })
        ])
    );
    
    var heading1Style = styles.findStyleByName("Heading 1");
    assert.equal(heading1Style.styleId, "Heading1");
    assert.equal(heading1Style.type, "paragraph");
    
    var warningStyle = styles.findStyleByName("Warning Text");
    assert.equal(warningStyle.styleId, "WarningText");
    assert.equal(warningStyle.type, "character");
});

test('findStyleByName is case-insensitive', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            styleElementWithProperties("paragraph", "Heading1", "Heading 1", {
                runProperties: {
                    fontSize: "32",
                    isBold: true
                }
            })
        ])
    );
    
    var heading1Style = styles.findStyleByName("heading 1");
    assert.equal(heading1Style.styleId, "Heading1");
});

test('getAllStyles returns all styles by name', function() {
    var styles = readStylesXml(
        new XmlElement("w:styles", {}, [
            styleElementWithProperties("paragraph", "Heading1", "Heading 1", {
                runProperties: {
                    fontSize: "32",
                    isBold: true
                }
            }),
            styleElementWithProperties("character", "WarningText", "Warning Text", {
                runProperties: {
                    color: "FF0000",
                    isItalic: true
                }
            })
        ])
    );
    
    var allStyles = styles.getAllStyles();
    assert.equal(Object.keys(allStyles).length, 2);
    assert.equal(allStyles["heading 1"].styleId, "Heading1");
    assert.equal(allStyles["warning text"].styleId, "WarningText");
});

function paragraphStyleElement(id, name) {
    return styleElement("paragraph", id, name);
}

function characterStyleElement(id, name) {
    return styleElement("character", id, name);
}

function tableStyleElement(id, name) {
    return styleElement("table", id, name);
}

function styleElement(type, id, name) {
    return new XmlElement("w:style", {"w:type": type, "w:styleId": id}, [
        new XmlElement("w:name", {"w:val": name}, [])
    ]);
}

function styleElementWithProperties(type, id, name, properties) {
    var elements = [new XmlElement("w:name", {"w:val": name}, [])];
    
    if (properties.runProperties) {
        var rPrChildren = [];
        if (properties.runProperties.fontSize) {
            rPrChildren.push(new XmlElement("w:sz", {"w:val": properties.runProperties.fontSize}, []));
        }
        if (properties.runProperties.isBold) {
            rPrChildren.push(new XmlElement("w:b", {}, []));
        }
        if (properties.runProperties.isItalic) {
            rPrChildren.push(new XmlElement("w:i", {}, []));
        }
        if (properties.runProperties.color) {
            rPrChildren.push(new XmlElement("w:color", {"w:val": properties.runProperties.color}, []));
        }
        if (properties.runProperties.font) {
            rPrChildren.push(new XmlElement("w:rFonts", {"w:ascii": properties.runProperties.font}, []));
        }
        elements.push(new XmlElement("w:rPr", {}, rPrChildren));
    }
    
    if (properties.paragraphProperties) {
        var pPrChildren = [];
        if (properties.paragraphProperties.alignment) {
            pPrChildren.push(new XmlElement("w:jc", {"w:val": properties.paragraphProperties.alignment}, []));
        }
        elements.push(new XmlElement("w:pPr", {}, pPrChildren));
    }
    
    return new XmlElement("w:style", {"w:type": type, "w:styleId": id}, elements);
}

function styleWithoutWNameElement(type, id) {
    return new XmlElement("w:style", {"w:type": type, "w:styleId": id}, []);
}
