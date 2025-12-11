var documents = require('../lib/documents');

// Create two documents, one with styles and one without
var doc1 = documents.Document([], {styles: null});
var doc2 = documents.Document([], {styles: null});

// Check if they have the same methods
console.log('doc1 has getUserStyle:', typeof doc1.getUserStyle === 'function');
console.log('doc2 has getUserStyle:', typeof doc2.getUserStyle === 'function');
console.log('doc1 has getAllUserStyles:', typeof doc1.getAllUserStyles === 'function');
console.log('doc2 has getAllUserStyles:', typeof doc2.getAllUserStyles === 'function');

// Check if they are equal
var assert = require('assert');
try {
    assert.deepEqual(doc1, doc2);
    console.log('✓ Documents are equal');
} catch (error) {
    console.error('✗ Documents are not equal');
    console.error('Message:', error.message);
}

// Now check the structure of a document without styles
console.log('Document structure without styles:', JSON.stringify(doc1, null, 2));
