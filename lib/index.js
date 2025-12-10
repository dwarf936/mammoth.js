var _ = require("underscore");

var docxReader = require("./docx/docx-reader");
var docxStyleMap = require("./docx/style-map");
var DocumentConverter = require("./document-to-html").DocumentConverter;
var convertElementToRawText = require("./raw-text").convertElementToRawText;
var readStyle = require("./style-reader").readStyle;
var readOptions = require("./options-reader").readOptions;
var unzip = require("./unzip");
var Result = require("./results").Result;

exports.convertToHtml = convertToHtml;
exports.convertToMarkdown = convertToMarkdown;
exports.convert = convert;
exports.extractRawText = extractRawText;
exports.getUserStyle = getUserStyle;
exports.images = require("./images");
exports.transforms = require("./transforms");
exports.underline = require("./underline");
exports.embedStyleMap = embedStyleMap;
exports.readEmbeddedStyleMap = readEmbeddedStyleMap;

function convertToHtml(input, options) {
    return convert(input, options);
}

function convertToMarkdown(input, options) {
    var markdownOptions = Object.create(options || {});
    markdownOptions.outputFormat = "markdown";
    return convert(input, markdownOptions);
}

function convert(input, options) {
    options = readOptions(options);

    return unzip.openZip(input)
        .tap(function(docxFile) {
            return docxStyleMap.readStyleMap(docxFile).then(function(styleMap) {
                options.embeddedStyleMap = styleMap;
            });
        })
        .then(function(docxFile) {
            return docxReader.read(docxFile, input, options)
                .then(function(documentResult) {
                    return documentResult.map(options.transformDocument);
                })
                .then(function(documentResult) {
                    return convertDocumentToHtml(documentResult, options);
                });
        });
}

function getUserStyle(input, styleName) {
    return unzip.openZip(input)
        .then(function(docxFile) {
            return readStylesFromZipFile(docxFile)
                .then(function(styles) {
                    var style = styles.findStyleByName(styleName);
                    if (!style) {
                        return null;
                    }
                    
                    return {
                        name: style.name,
                        fontSize: style.properties.fontSize,
                        font: style.properties.font,
                        color: style.properties.color,
                        isBold: style.properties.isBold,
                        isItalic: style.properties.isItalic,
                        isStrikethrough: style.properties.isStrikethrough,
                        alignment: style.properties.alignment
                    };
                });
        });
}

function readStylesFromZipFile(docxFile) {
    var stylesReader = require("./docx/styles-reader");
    var readXmlFromZipFile = require("./docx/office-xml-reader").readXmlFromZipFile;
    
    return findPartPaths(docxFile)
        .then(function(partPaths) {
            return readXmlFromZipFile(docxFile, partPaths.styles);
        })
        .then(function(xml) {
            return stylesReader.readStylesXml(xml);
        });
}

function findPartPaths(docxFile) {
    var docxReader = require("./docx/docx-reader");
    return docxReader._findPartPaths(docxFile);
}

function readEmbeddedStyleMap(input) {
    return unzip.openZip(input)
        .then(docxStyleMap.readStyleMap);
}

function convertDocumentToHtml(documentResult, options) {
    var styleMapResult = parseStyleMap(options.readStyleMap());
    var parsedOptions = _.extend({}, options, {
        styleMap: styleMapResult.value
    });
    var documentConverter = new DocumentConverter(parsedOptions);

    return documentResult.flatMapThen(function(document) {
        return styleMapResult.flatMapThen(function(styleMap) {
            return documentConverter.convertToHtml(document);
        });
    });
}

function parseStyleMap(styleMap) {
    return Result.combine((styleMap || []).map(readStyle))
        .map(function(styleMap) {
            return styleMap.filter(function(styleMapping) {
                return !!styleMapping;
            });
        });
}


function extractRawText(input) {
    return unzip.openZip(input)
        .then(docxReader.read)
        .then(function(documentResult) {
            return documentResult.map(convertElementToRawText);
        });
}

function embedStyleMap(input, styleMap) {
    return unzip.openZip(input)
        .tap(function(docxFile) {
            return docxStyleMap.writeStyleMap(docxFile, styleMap);
        })
        .then(function(docxFile) {
            return docxFile.toArrayBuffer();
        })
        .then(function(arrayBuffer) {
            return {
                toArrayBuffer: function() {
                    return arrayBuffer;
                },
                toBuffer: function() {
                    return Buffer.from(arrayBuffer);
                }
            };
        });
}

exports.styleMapping = function() {
    throw new Error('Use a raw string instead of mammoth.styleMapping e.g. "p[style-name=\'Title\'] => h1" instead of mammoth.styleMapping("p[style-name=\'Title\'] => h1")');
};
