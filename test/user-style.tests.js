var assert = require("assert");

var mammoth = require("../lib/");
var test = require("./test")(module);
var testPath = require("./testing").testPath;

test("getUserStyle should find style by name and return its properties", function() {
    return mammoth.getUserStyle({path: testPath("single-paragraph.docx")}, "Normal")
        .then(function(style) {
            assert.ok(style !== null);
            assert.equal(style.name, "Normal");
            assert.equal(style.type, "paragraph");
            // Normal style may not have explicit font size set
            assert.ok(style.fontSize === null || style.fontSize === 11);
        });
});

test("getUserStyle should return for test style", function() {
    return mammoth.getUserStyle({path: testPath("style-id.docx")}, "test")
        .then(function(style) {
            assert.deepStrictEqual(style, {
                alignment: 'center',
                color: null,
                font: undefined,
                fontSize: null,
                isBold: true,
                isItalic: true,
                isStrikethrough: false,
                isUnderline: false,
                name: 'test',
                type: 'paragraph'
            });
        });
});

test("getUserStyle should return null for non-existent style", function() {
    return mammoth.getUserStyle({path: testPath("single-paragraph.docx")}, "Non-existent Style")
        .then(function(style) {
            assert.equal(style, null);
        });
});

test("getUserStyle should be case-insensitive", function() {
    return mammoth.getUserStyle({path: testPath("single-paragraph.docx")}, "normal")
        .then(function(style) {
            assert.ok(style !== null);
            assert.equal(style.name, "Normal");
        });
});

test("getAllStyles should return all named styles", function() {
    return mammoth.getAllStyles({path: testPath("single-paragraph.docx")})
        .then(function(styles) {
            assert.ok(Array.isArray(styles));
            assert.ok(styles.length > 0);
            var normalStyle = styles.find(function(s) {
                return s.name === "Normal";
            });
            assert.ok(normalStyle !== undefined);
        });
});
