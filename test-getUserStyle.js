var fs = require("fs");
var path = require("path");
var mammoth = require("./lib/index");

var testDataDir = path.join(__dirname, "test", "test-data");

function readTestData(filename) {
    return fs.readFileSync(path.join(testDataDir, filename));
}

function testDocx(filename) {
    return readTestData(filename + ".docx");
}

console.log("Testing getUserStyle method...");

mammoth.getUserStyle(testDocx("single-paragraph"), "Normal").then(function(result) {
    console.log("Result:", result.value);
    if (result.value) {
        console.log("✓ Style found:", result.value.name, "(type:", result.value.type, ")");
    } else {
        console.log("✗ Style not found");
    }
}).catch(function(error) {
    console.error("Error:", error);
});