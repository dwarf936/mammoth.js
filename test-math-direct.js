var documents = require('./lib/documents');
var DocumentConverter = require('./lib/document-to-html').DocumentConverter;

// Create a Math element
var mathElement = documents.Math({
    latex: 'A = \u03C0r^2',
    type: 'display'
});

// Create a converter
var converter = new DocumentConverter();

// Convert the Math element to HTML
converter.convertToHtml(mathElement)
    .then(function(result) {
        console.log('Converted HTML:', result.value);
        console.log('Messages:', result.messages);
    })
    .catch(function(error) {
        console.error('Error:', error);
    });
