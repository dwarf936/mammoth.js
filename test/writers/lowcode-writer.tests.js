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

            // 验证 schema 结构
            assert.ok(schema.componentsTree, 'Schema must have componentsTree');
            assert(Array.isArray(schema.componentsTree), 'componentsTree must be an array');
            assert.equal(schema.componentsTree.length, 3, 'componentsTree should have 3 components');

            // 验证每个组件都有 componentName
            schema.componentsTree.forEach(function(component, index) {
                assert.ok(component.componentName, 'Component at index ' + index + ' must have componentName');
            });

            // 验证具体组件内容
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
