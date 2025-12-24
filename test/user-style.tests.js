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
});
