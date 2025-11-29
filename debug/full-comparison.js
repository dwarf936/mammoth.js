var assert = require('assert');
var documents = require('../lib/documents');
var stylesReader = require('../lib/docx/styles-reader');
var _ = require('underscore');

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

// Let's do a manual comparison
console.log('=== Manual Document Comparison ===');

// Check type
if (expectedDocument.type !== actualDocument.type) {
    console.log('Type differs:', expectedDocument.type, actualDocument.type);
}

// Check children
var expectedChildren = expectedDocument.children;
var actualChildren = actualDocument.children;
console.log('Number of children:', expectedChildren.length, actualChildren.length);

// Check each child
expectedChildren.forEach((expectedChild, index) => {
    var actualChild = actualChildren[index];
    console.log(`\nChild ${index} type:`, expectedChild.type, actualChild.type);
    
    // Check child properties
    var expectedProps = _.keys(expectedChild);
    var actualProps = _.keys(actualChild);
    console.log('Child properties:', expectedProps, actualProps);
    
    // Check each property
    _.union(expectedProps, actualProps).forEach(prop => {
        if (prop === 'children') return; // We'll check children separately
        if (prop === '_styles') return; // We already checked styles
        if (expectedChild[prop] !== actualChild[prop]) {
            console.log(`  Property ${prop} differs:`, expectedChild[prop], actualChild[prop]);
        }
    });
    
    // Check child children
    if (expectedChild.children) {
        console.log(`  Number of child children:`, expectedChild.children.length, actualChild.children.length);
    }
});

// Check notes
console.log('\nNotes comparison:');
console.log('Expected notes:', expectedDocument.notes);
console.log('Actual notes:', actualDocument.notes);
console.log('Notes are equal?', _.isEqual(expectedDocument.notes, actualDocument.notes));

// Check comments
console.log('\nComments comparison:');
console.log('Expected comments:', expectedDocument.comments);
console.log('Actual comments:', actualDocument.comments);
console.log('Comments are equal?', _.isEqual(expectedDocument.comments, actualDocument.comments));

// Check styles
console.log('\nStyles comparison:');
console.log('Expected styles:', expectedDocument._styles);
console.log('Actual styles:', actualDocument._styles);
console.log('Styles are equal?', _.isEqual(expectedDocument._styles, actualDocument._styles));

// Now try the assert again but with a custom error message
console.log('\n=== Final Assert ===');
try {
    assert.deepEqual(expectedDocument, actualDocument, 'Documents should be equal');
    console.log('✓ Documents are equal');
} catch (error) {
    console.error('✗ Documents are not equal');
    console.error('Error:', error.message);
    
    // Let's see if we can find the exact difference using underscore
    var differences = _.find(expectedDocument, (value, key) => {
        return !_.isEqual(value, actualDocument[key]);
    });
    console.log('First differing property:', differences);
}
