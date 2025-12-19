var assert = require("assert");
var mammoth = require("../../lib/index");
var fs = require("fs");
var path = require("path");

describe("lowcode-writer", function() {
    it("should convert docx to lowcode schema with componentsTree", function(done) {
        var testDocxPath = path.join(__dirname, "../test-data/single-paragraph.docx");
        var testDocx = fs.readFileSync(testDocxPath);
        
        mammoth.convertToLowcode({buffer: testDocx})
            .then(function(result) {
                var schema = result.value;
                
                // 验证基本结构
                assert.ok(schema);
                assert.ok(schema.componentsTree);
                assert(Array.isArray(schema.componentsTree));
                done();
            })
            .done();
    });
    
    it("should handle single paragraph conversion correctly", function(done) {
        var testDocxPath = path.join(__dirname, "../test-data/single-paragraph.docx");
        var testDocx = fs.readFileSync(testDocxPath);
        
        mammoth.convertToLowcode({buffer: testDocx})
            .then(function(result) {
                var schema = result.value;
                
                // 验证段落组件
                assert.equal(schema.componentsTree.length, 1);
                var paragraph = schema.componentsTree[0];
                assert.equal(paragraph.componentName, "p");
                assert.deepEqual(paragraph.props, {});
                assert.equal(paragraph.children.length, 1);
                assert.equal(paragraph.children[0], "Walking on imported air");
                done();
            })
            .done();
    });
    
    it("should handle image conversion correctly", function(done) {
        var testDocxPath = path.join(__dirname, "../test-data/tiny-picture.docx");
        var testDocx = fs.readFileSync(testDocxPath);
        
        mammoth.convertToLowcode({buffer: testDocx})
            .then(function(result) {
                var schema = result.value;
                
                assert.ok(schema.componentsTree);
                assert(schema.componentsTree.length > 0);
                
                // 查找图片组件
                var hasImage = false;
                function checkForImage(components) {
                    components.forEach(function(component) {
                        if (component.componentName === "img") {
                            hasImage = true;
                            assert.ok(component.props.src);
                            assert.ok(component.props.src.startsWith("data:image/"));
                        }
                        if (component.children && Array.isArray(component.children)) {
                            checkForImage(component.children.filter(function(child) {
                                return typeof child !== "string";
                            }));
                        }
                    });
                }
                
                checkForImage(schema.componentsTree);
                assert.ok(hasImage, "Image component not found in componentsTree");
                done();
            })
            .done();
    });
    
    it("should handle list conversion correctly", function(done) {
        var testDocxPath = path.join(__dirname, "../test-data/simple-list.docx");
        var testDocx = fs.readFileSync(testDocxPath);
        
        mammoth.convertToLowcode({buffer: testDocx})
            .then(function(result) {
                var schema = result.value;
                
                assert.ok(schema.componentsTree);
                assert(schema.componentsTree.length > 0);
                
                // 查找列表组件
                var hasList = false;
                schema.componentsTree.forEach(function(component) {
                    if (component.componentName === "ul" || component.componentName === "ol") {
                        hasList = true;
                        assert.ok(component.children.length > 0);
                    }
                });
                
                assert.ok(hasList, "List component not found in componentsTree");
                done();
            })
            .done();
    });
    
    it("should handle heading conversion with style mappings", function(done) {
        // 使用模拟的标题文档测试样式映射
        var documents = require("../../lib/documents");
        var documentToHtml = require("../../lib/document-to-html");
        var DocumentConverter = documentToHtml.DocumentConverter;
        var documentMatchers = require("../../lib/styles/document-matchers");
        var htmlPaths = require("../../lib/styles/html-paths");
        
        // 创建一个包含标题的测试文档
        var document = new documents.Document([
            paragraphOfText("Test Heading", "Heading1", "Heading 1")
        ]);
        
        var converter = new DocumentConverter({
            styleMap: [
                {
                    from: documentMatchers.paragraph({styleName: documentMatchers.equalTo("Heading 1")}),
                    to: htmlPaths.topLevelElement("h1")
                }
            ]
        });
        
        converter.convertToLowcode(document)
            .then(function(result) {
                var schema = result.value;
                
                assert.equal(schema.componentsTree.length, 1);
                var heading = schema.componentsTree[0];
                assert.equal(heading.componentName, "h1");
                assert.equal(heading.children.length, 1);
                assert.equal(heading.children[0], "Test Heading");
                done();
            })
            .done();
    });
    
    // 辅助函数，用于创建测试段落
    function paragraphOfText(text, styleId, styleName) {
        var documents = require("../../lib/documents");
        var run = new documents.Run([
            new documents.Text(text)
        ]);
        return new documents.Paragraph([run], {
            styleId: styleId,
            styleName: styleName
        });
    }
});
