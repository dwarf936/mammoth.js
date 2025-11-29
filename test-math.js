const mammoth = require('./lib/index');
const fs = require('fs');

// Read the test document
fs.readFile('test-math.docx', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Convert to HTML
    mammoth.convertToHtml({buffer: data}, {prettyPrint: true})
        .then(result => {
            const html = result.value;
            const messages = result.messages;

            console.log('Converted HTML:');
            console.log(html);

            if (messages.length > 0) {
                console.log('\nMessages:');
                messages.forEach(message => console.log(message));
            }
        })
        .catch(err => console.error('Error converting document:', err));
});