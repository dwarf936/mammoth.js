var _ = require("underscore");

var docxReader = require("./docx/docx-reader");
var docxStyleMap = require("./docx/style-map");
var DocumentConverter = require("./document-to-html").DocumentConverter;
var convertElementToRawText = require("./raw-text").convertElementToRawText;
var readStyle = require("./style-reader").readStyle;
var readOptions = require("./options-reader").readOptions;
var unzip = require("./unzip");
var Result = require("./results").Result;

var stylesReader = require("./docx/styles-reader");

var xmlFileReader = require("./docx/office-xml-reader").readXmlFromZipFile;

var zipfile = require("./zipfile");

var relationshipsReader = require("./docx/relationships-reader");


exports.convertToHtml = convertToHtml;
exports.convertToMarkdown = convertToMarkdown;
exports.convert = convert;
exports.extractRawText = extractRawText;
exports.images = require("./images");
exports.transforms = require("./transforms");
exports.underline = require("./underline");
exports.embedStyleMap = embedStyleMap;
exports.readEmbeddedStyleMap = readEmbeddedStyleMap;
exports.getUserStyle = getUserStyle;

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

function getUserStyle(input, styleName, options) {
    options = readOptions(options);
    
    return unzip.openZip(input)
        .then(function(docxFile) {
            return findPartPaths(docxFile).then(function(partPaths) {
                return readStylesFromZipFile(docxFile, partPaths.styles).then(function(styles) {
                    var style = findStyleByName(styles, styleName);
                    return style ? new Result(style) : new Result(null);
                });
            });
        });
}

function findPartPaths(docxFile) {
    return readPackageRelationships(docxFile).then(function(packageRelationships) {
        var mainDocumentPath = findPartPath({
            docxFile: docxFile,
            relationships: packageRelationships,
            relationshipType: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
            basePath: "",
            fallbackPath: "word/document.xml"
        });

        if (!docxFile.exists(mainDocumentPath)) {
            throw new Error("Could not find main document part. Are you sure this is a valid .docx file?");
        }

        return xmlFileReader(docxFile, relationshipsFilename(mainDocumentPath))
            .then(function(documentRelationships) {
                documentRelationships = documentRelationships ? relationshipsReader.readRelationships(documentRelationships) : relationshipsReader.defaultValue;
                
                function findPartRelatedToMainDocument(name) {
                    return findPartPath({
                        docxFile: docxFile,
                        relationships: documentRelationships,
                        relationshipType: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/" + name,
                        basePath: zipfile.splitPath(mainDocumentPath).dirname,
                        fallbackPath: "word/" + name + ".xml"
                    });
                }

                return {
                    mainDocument: mainDocumentPath,
                    comments: findPartRelatedToMainDocument("comments"),
                    endnotes: findPartRelatedToMainDocument("endnotes"),
                    footnotes: findPartRelatedToMainDocument("footnotes"),
                    numbering: findPartRelatedToMainDocument("numbering"),
                    styles: findPartRelatedToMainDocument("styles")
                };
            });
    });
}

function findPartPath(options) {
    var docxFile = options.docxFile;
    var relationships = options.relationships;
    var relationshipType = options.relationshipType;
    var basePath = options.basePath;
    var fallbackPath = options.fallbackPath;

    var targets = relationships.findTargetsByType(relationshipType);
    var normalisedTargets = targets.map(function(target) {
        return stripPrefix(zipfile.joinPath(basePath, target), "/");
    });
    var validTargets = normalisedTargets.filter(function(target) {
        return docxFile.exists(target);
    });
    if (validTargets.length === 0) {
        return fallbackPath;
    } else {
        return validTargets[0];
    }
}

function stripPrefix(value, prefix) {
    if (value.substring(0, prefix.length) === prefix) {
        return value.substring(prefix.length);
    } else {
        return value;
    }
}

function relationshipsFilename(filename) {
    var split = zipfile.splitPath(filename);
    return zipfile.joinPath(split.dirname, "_rels", split.basename + ".rels");
}

function readPackageRelationships(zipFile) {
    return xmlFileReader(zipFile, "_rels/.rels")
        .then(function(element) {
            return element ? relationshipsReader.readRelationships(element) : relationshipsReader.defaultValue;
        });
}

function readStylesFromZipFile(zipFile, path) {
    return xmlFileReader(zipFile, path)
        .then(function(element) {
            return element ? stylesReader.readStylesXml(element) : stylesReader.defaultStyles;
        });
}

function findStyleByName(styles, styleName) {
    var foundStyle = null;
    
    // 检查段落样式
    var paragraphStyles = styles.getParagraphStyles();
    for (var paraKey in paragraphStyles) {
        if (paragraphStyles.hasOwnProperty(paraKey)) {
            var paraStyle = paragraphStyles[paraKey];
            if (paraStyle.name && paraStyle.name === styleName) {
                foundStyle = paraStyle;
                break;
            }
        }
    }
    
    // 如果段落样式没找到，检查字符样式
    if (!foundStyle) {
        var characterStyles = styles.getCharacterStyles();
        for (var charKey in characterStyles) {
            if (characterStyles.hasOwnProperty(charKey)) {
                var charStyle = characterStyles[charKey];
                if (charStyle.name && charStyle.name === styleName) {
                    foundStyle = charStyle;
                    break;
                }
            }
        }
    }
    
    // 如果字符样式没找到，检查表格样式
    if (!foundStyle) {
        var tableStyles = styles.getTableStyles();
        for (var tableKey in tableStyles) {
            if (tableStyles.hasOwnProperty(tableKey)) {
                var tableStyle = tableStyles[tableKey];
                if (tableStyle.name && tableStyle.name === styleName) {
                    foundStyle = tableStyle;
                    break;
                }
            }
        }
    }
    
    // 如果表格样式没找到，检查编号样式
    if (!foundStyle) {
        var numberingStyles = styles.getNumberingStyles();
        for (var numKey in numberingStyles) {
            if (numberingStyles.hasOwnProperty(numKey)) {
                var numStyle = numberingStyles[numKey];
                if (numStyle.name && numStyle.name === styleName) {
                    foundStyle = numStyle;
                    break;
                }
            }
        }
    }
    
    return foundStyle;
}
