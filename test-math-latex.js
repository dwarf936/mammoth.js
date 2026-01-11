var mammoth = require('./lib');

var docxPath = 'math-formula.docx';

mammoth.convert({path: docxPath})
    .then(function(result) {
        console.log(result.value);
        result.messages.forEach(function(message) {
            console.log(message.message);
        });
    })
    .done();