var mammoth = require("./lib/index.js");
var fs = require("fs");
var testDocx = fs.readFileSync('./test/test-data/simple-list.docx');
        
mammoth.convertToLowcodeSchema({buffer: testDocx})
    .then(function(result) {
        var schema = result.value;
        
        console.log(JSON.stringify(schema, null, 2))
    })
