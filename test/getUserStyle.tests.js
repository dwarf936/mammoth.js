var assert = require("assert");
var fs = require("fs");
var path = require("path");
var mammoth = require("../lib/index");

var testDataDir = path.join(__dirname, "test-data");

function readTestData(filename) {
    return fs.readFileSync(path.join(testDataDir, filename));
}

function testDocx(filename) {
    return readTestData(filename + ".docx");
}

describe("getUserStyle", function() {
    it("should return a paragraph style by name", function() {
        return mammoth.getUserStyle(testDocx("single-paragraph"), "Normal").then(function(result) {
            assert.equal(result.value.type, "paragraph");
            assert.equal(result.value.name, "Normal");
        });
    });
    
    it("should return null for non-existent style", function() {
        return mammoth.getUserStyle(testDocx("single-paragraph"), "NonExistentStyle").then(function(result) {
            assert.equal(result.value, null);
        });
    });
});
