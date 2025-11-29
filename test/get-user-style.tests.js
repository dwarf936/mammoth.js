var fs = require("fs");
var path = require("path");
var assert = require("assert");
var mammoth = require("../lib");

describe("getUserStyle", function() {
    var testDataPath = path.join(__dirname, "test-data");
    
    it("should return style information for Normal style", function() {
        var docxPath = path.join(testDataPath, "embedded-style-map.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "Normal")
            .then(function(style) {
                assert(style, "Normal style should be found");
                assert.equal(style.name, "Normal");
                assert.equal(style.type, "paragraph");
                assert(style.styleId, "Should have styleId");
            });
    });
    
    it("should return style information for NoList style", function() {
        var docxPath = path.join(testDataPath, "embedded-style-map.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "NoList")
            .then(function(style) {
                assert(style, "NoList style should be found");
                assert.equal(style.styleId, "NoList");
                assert.equal(style.type, "numbering");
            });
    });
    
    it("should return style information by style ID", function() {
        var docxPath = path.join(testDataPath, "embedded-style-map.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "TableNormal")
            .then(function(style) {
                assert(style, "Style should be found");
                assert.equal(style.name, "Normal Table");
                assert.equal(style.type, "table");
            });
    });
    
    it("should return null for non-existent style", function() {
        var docxPath = path.join(testDataPath, "embedded-style-map.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "NonExistentStyle")
            .then(function(style) {
                assert.equal(style, null);
            });
    });
    
    it("should extract font properties from character styles", function() {
        var docxPath = path.join(testDataPath, "embedded-style-map.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "Default Paragraph Font")
            .then(function(style) {
                assert(style, "Style should be found");
                assert.equal(style.name, "Default Paragraph Font");
                assert.equal(style.type, "character");
                // The style should have some formatting properties
                if (style.properties && style.properties.runProperties) {
                    var runProps = style.properties.runProperties;
                    if (runProps.fontSize) {
                        assert(typeof runProps.fontSize === 'number' || typeof runProps.fontSize === 'string');
                    }
                    if (runProps.color) {
                        assert(typeof runProps.color === 'string');
                    }
                    if (runProps.bold !== undefined) {
                        assert(typeof runProps.bold === 'boolean');
                    }
                    if (runProps.italic !== undefined) {
                        assert(typeof runProps.italic === 'boolean');
                    }
                }
            });
    });
    
    it("should extract paragraph properties from paragraph styles", function() {
        var docxPath = path.join(testDataPath, "embedded-style-map.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "Normal")
            .then(function(style) {
                assert(style, "Style should be found");
                assert.equal(style.name, "Normal");
                assert.equal(style.type, "paragraph");
                
                // Check for paragraph properties
                if (style.alignment) {
                    assert(typeof style.alignment === 'string');
                }
                if (style.spacingBefore !== undefined) {
                    assert(typeof style.spacingBefore === 'number');
                }
                if (style.spacingAfter !== undefined) {
                    assert(typeof style.spacingAfter === 'number');
                }
                if (style.lineSpacing !== undefined) {
                    assert(typeof style.lineSpacing === 'number');
                }
                if (style.leftIndent !== undefined) {
                    assert(typeof style.leftIndent === 'number');
                }
                if (style.rightIndent !== undefined) {
                    assert(typeof style.rightIndent === 'number');
                }
                if (style.firstLineIndent !== undefined) {
                    assert(typeof style.firstLineIndent === 'number');
                }
            });
    });
    
    it("should handle numbering styles", function() {
        var docxPath = path.join(testDataPath, "simple-list.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "List Paragraph")
            .then(function(style) {
                assert(style, "Style should be found");
                assert.equal(style.type, "paragraph");
                // Numbering styles might have numId property
                if (style.numId !== undefined) {
                    assert(typeof style.numId === 'number');
                }
            });
    });
    
    it("should handle table styles", function() {
        var docxPath = path.join(testDataPath, "embedded-style-map.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "TableNormal")
            .then(function(style) {
                assert(style, "Style should be found");
                assert.equal(style.type, "table");
                assert(style.properties.tableProperties, "Should have table properties");
            });
    });
    
    it("should clean up undefined properties", function() {
        var docxPath = path.join(testDataPath, "embedded-style-map.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "Normal")
            .then(function(style) {
                assert(style, "Style should be found");
                
                // Ensure no undefined properties exist
                Object.keys(style).forEach(function(key) {
                    assert.notEqual(style[key], undefined, "Property " + key + " should not be undefined");
                });
            });
    });
    
    it("should work with different DOCX files", function() {
        var docxPath = path.join(testDataPath, "simple-list.docx");
        var buffer = fs.readFileSync(docxPath);
        
        return mammoth.getUserStyle(buffer, "Normal")
            .then(function(style) {
                assert(style, "Style should be found");
                assert.equal(style.name, "Normal");
                assert.equal(style.type, "paragraph");
            });
    });
    
    it("should handle error cases gracefully", function() {
        var invalidBuffer = Buffer.from("invalid docx content");
        
        return mammoth.getUserStyle(invalidBuffer, "Normal")
            .then(function() {
                assert.fail("Should have thrown an error for invalid DOCX");
            })
            .catch(function(error) {
                assert(error, "Should throw an error for invalid DOCX");
            });
    });
});
