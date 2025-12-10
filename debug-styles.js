/* eslint-disable no-console */
var mammoth = require('./lib/');
var testPath = require('./test/testing').testPath;

mammoth.getAllStyles({path: testPath('single-paragraph.docx')})
    .then(function(styles) {
        console.log('All styles found:', styles);
    })
    .catch(function(error) {
        console.error('Error reading styles:', error);
    });

