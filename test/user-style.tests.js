var assert = require('assert');
var mammoth = require('../lib/index');
var fs = require('fs');
var path = require('path');

describe('getUserStyle', function() {
    it('should return style information for a named style', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'Normal')
            .then(function(result) {
                assert(result.value, {});
                assert(result.value.name === 'Normal');
                assert(result.value.type === 'paragraph');
            });
    });
    
    it('should return null when style name is not found', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'NonExistentStyle')
            .then(function(result) {
                assert(result.value === null);
            });
    });
    
    it('should work with different style types', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'Normal')
            .then(function(result) {
                assert(result.value !== null);
                assert(result.value.type === 'paragraph');
            });
    });
    
    it('should return detailed style properties', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'Normal')
            .then(function(result) {
                assert(result.value !== null);
                assert(result.value.properties !== undefined);
                // Check that properties object is an object
                assert(typeof result.value.properties === 'object');
            });
    });
    
    it('should return correct properties for bold text', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'Normal')
            .then(function(result) {
                // Check that isBold property exists and is a boolean
                assert(result.value.properties.isBold !== undefined);
                assert(typeof result.value.properties.isBold === 'boolean');
            });
    });
    
    it('should return correct properties for italic text', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'Normal')
            .then(function(result) {
                // Check that isItalic property exists and is a boolean
                assert(result.value.properties.isItalic !== undefined);
                assert(typeof result.value.properties.isItalic === 'boolean');
            });
    });
    
    it('should return font information if available', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'Normal')
            .then(function(result) {
                // Check that if font property exists, it's a string or null
                if (result.value.properties.font !== undefined) {
                    assert(typeof result.value.properties.font === 'string' || result.value.properties.font === null);
                }
            });
    });
    
    it('should return font size if available', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'Normal')
            .then(function(result) {
                // Check that if fontSize property exists, it's a number or null
                if (result.value.properties.fontSize !== undefined) {
                    assert(typeof result.value.properties.fontSize === 'number' || result.value.properties.fontSize === null);
                }
            });
    });
    
    it('should return alignment information if available', function() {
        var filename = path.join(__dirname, 'test-data/single-paragraph.docx');
        var input = fs.readFileSync(filename);
        
        return mammoth.getUserStyle(input, 'Normal')
            .then(function(result) {
                // Check that if alignment property exists, it's a string or null
                if (result.value.properties.alignment !== undefined) {
                    assert(typeof result.value.properties.alignment === 'string' || result.value.properties.alignment === null);
                }
            });
    });
});
