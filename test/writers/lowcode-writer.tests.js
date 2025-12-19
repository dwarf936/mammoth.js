var assert = require('assert');
var lowcodeWriter = require('../../lib/writers/lowcode-writer');

describe('lowcode-writer', function() {
    describe('convertToLowcodeSchema', function() {
        it('should convert simplified HTML to lowcode schema with componentsTree', function() {
            var simplifiedHtml = [
                {
                    type: 'element',
                    tagName: 'h1',
                    attributes: {},
                    children: [
                        {type: 'text', value: 'Test Heading'}
                    ]
                },
                {
                    type: 'element',
                    tagName: 'p',
                    attributes: {},
                    children: [
                        {type: 'text', value: 'This is a test paragraph.'}
                    ]
                },
                {
                    type: 'element',
                    tagName: 'img',
                    attributes: {src: 'test-image.png', alt: 'Test Image'},
                    children: []
                }
            ];

            var schema = lowcodeWriter.convertToLowcodeSchema(simplifiedHtml);

            assert.deepEqual(schema, {
                componentsTree: [
                    {
                        componentName: 'h1',
                        props: {},
                        children: ['Test Heading']
                    },
                    {
                        componentName: 'p',
                        props: {},
                        children: ['This is a test paragraph.']
                    },
                    {
                        componentName: 'img',
                        props: {src: 'test-image.png', alt: 'Test Image'},
                        children: []
                    }
                ]
            });
        });
    });
});
