var assert = require('assert');
var documents = require('../lib/documents');
var docxReader = require('../lib/docx/docx-reader');
var testing = require('../test/testing');
var testData = testing.testData;
var createFakeDocxFile = testing.createFakeDocxFile;

var expectedDocument = documents.Document([
    documents.Paragraph([
        documents.Run([
            documents.Text('Hello.')
        ])
    ])
]);

var docxFile = createFakeDocxFile({
    'word/document.xml': testData('simple/word/document.xml')
});

docxReader.read(docxFile).then(function(result) {
    console.log('Expected:', JSON.stringify(expectedDocument, null, 2));
    console.log('Actual:', JSON.stringify(result.value, null, 2));
    try {
        assert.deepEqual(expectedDocument, result.value);
        console.log('✓ Assertion passed');
    } catch (error) {
        console.error('✗ Assertion failed');
        console.error('Message:', error.message);
        console.error('Expected:', JSON.stringify(error.expected, null, 2));
        console.error('Actual:', JSON.stringify(error.actual, null, 2));
    }
});
