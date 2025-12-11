var assert = require('assert');
var documents = require('../lib/documents');
var stylesReader = require('../lib/docx/styles-reader');

// Create expected document
var expectedDocument = documents.Document([
    documents.Paragraph([
        documents.Run([
            documents.Text('Hello.')
        ])
    ])
]);

// Create a styles object like the one from docx reader
var actualStyles = stylesReader.defaultStyles;

// Create actual document with styles
var actualDocument = documents.Document([
    documents.Paragraph([
        documents.Run([
            documents.Text('Hello.')
        ])
    ])
], { styles: actualStyles });

// Log the documents
console.log('Expected document _styles:', expectedDocument._styles);
console.log('Actual document _styles:', actualDocument._styles);
console.log('Are styles objects the same instance?', expectedDocument._styles === actualDocument._styles);

// Try the comparison
console.log('Comparing documents...');
try {
    assert.deepEqual(expectedDocument, actualDocument);
    console.log('✓ Documents are equal');
} catch (error) {
    console.error('✗ Documents are not equal');
    console.error('Error:', error.message);
    console.error('Expected:', JSON.stringify(expectedDocument, null, 2));
    console.error('Actual:', JSON.stringify(actualDocument, null, 2));
}
