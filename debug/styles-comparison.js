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

// Log details about the styles objects
console.log('=== Styles Comparison ===');
console.log('Expected _styles:', expectedDocument._styles);
console.log('Actual _styles:', actualDocument._styles);
console.log('Are styles objects strictly equal?', expectedDocument._styles === actualDocument._styles);
console.log('Expected _styles constructor:', expectedDocument._styles.constructor.name);
console.log('Actual _styles constructor:', actualDocument._styles.constructor.name);

// Log the methods
console.log('\n=== Methods Comparison ===');
var expectedMethods = Object.keys(expectedDocument._styles);
var actualMethods = Object.keys(actualDocument._styles);
console.log('Expected methods:', expectedMethods);
console.log('Actual methods:', actualMethods);
console.log('Methods are the same?', JSON.stringify(expectedMethods) === JSON.stringify(actualMethods));

// Check if all methods exist in both
var allMethodsExist = true;
expectedMethods.forEach(method => {
    if (!(method in actualDocument._styles)) {
        console.log(`Missing method in actual: ${method}`);
        allMethodsExist = false;
    }
});
actualMethods.forEach(method => {
    if (!(method in expectedDocument._styles)) {
        console.log(`Missing method in expected: ${method}`);
        allMethodsExist = false;
    }
});
console.log('All methods exist in both?', allMethodsExist);

// Try comparing just the styles objects
console.log('\n=== Comparing Styles Objects ===');
try {
    assert.deepEqual(expectedDocument._styles, actualDocument._styles);
    console.log('✓ Styles objects are equal');
} catch (error) {
    console.error('✗ Styles objects are not equal');
    console.error('Error:', error.message);
    console.error('Expected:', expectedDocument._styles);
    console.error('Actual:', actualDocument._styles);
}

// Try comparing the documents
console.log('\n=== Comparing Documents ===');
try {
    assert.deepEqual(expectedDocument, actualDocument);
    console.log('✓ Documents are equal');
} catch (error) {
    console.error('✗ Documents are not equal');
    console.error('Error:', error.message);
    
    // Try to find the difference
    var expectedJSON = JSON.stringify(expectedDocument, null, 2);
    var actualJSON = JSON.stringify(actualDocument, null, 2);
    console.log('Documents have same JSON?', expectedJSON === actualJSON);
    console.log('Expected JSON length:', expectedJSON.length);
    console.log('Actual JSON length:', actualJSON.length);
}
