exports.readStylesXml = readStylesXml;
exports.Styles = Styles;
exports.defaultStyles = new Styles({}, {}, {}, {});

function Styles(paragraphStyles, characterStyles, tableStyles, numberingStyles) {
    paragraphStyles = paragraphStyles || {};
    characterStyles = characterStyles || {};
    tableStyles = tableStyles || {};
    numberingStyles = numberingStyles || {};
    // Create maps for quick lookup by style name
    var paragraphStylesByName = {};
    var characterStylesByName = {};
    var tableStylesByName = {};
    
    // Build name maps
    Object.keys(paragraphStyles).forEach(function(styleId) {
        var style = paragraphStyles[styleId];
        if (style.name) {
            paragraphStylesByName[style.name.toLowerCase()] = style;
        }
    });
    
    Object.keys(characterStyles).forEach(function(styleId) {
        var style = characterStyles[styleId];
        if (style.name) {
            characterStylesByName[style.name.toLowerCase()] = style;
        }
    });
    
    Object.keys(tableStyles).forEach(function(styleId) {
        var style = tableStyles[styleId];
        if (style.name) {
            tableStylesByName[style.name.toLowerCase()] = style;
        }
    });
    
    return {
        findParagraphStyleById: function(styleId) {
            return paragraphStyles[styleId];
        },
        findCharacterStyleById: function(styleId) {
            return characterStyles[styleId];
        },
        findTableStyleById: function(styleId) {
            return tableStyles[styleId];
        },
        findNumberingStyleById: function(styleId) {
            return numberingStyles[styleId];
        },
        findStyleByName: function(styleName) {
            var lowerName = styleName.toLowerCase();
            return paragraphStylesByName[lowerName] ||
                characterStylesByName[lowerName] ||
                tableStylesByName[lowerName] ||
                null;
        },
        getAllStyles: function() {
            var allStyles = [];
            Object.keys(paragraphStyles).forEach(function(styleId) {
                allStyles.push(paragraphStyles[styleId]);
            });
            Object.keys(characterStyles).forEach(function(styleId) {
                allStyles.push(characterStyles[styleId]);
            });
            Object.keys(tableStyles).forEach(function(styleId) {
                allStyles.push(tableStyles[styleId]);
            });
            return allStyles;
        }
    };
}

Styles.EMPTY = new Styles({}, {}, {}, {});

function readStylesXml(root) {
    var paragraphStyles = {};
    var characterStyles = {};
    var tableStyles = {};
    var numberingStyles = {};

    var styles = {
        "paragraph": paragraphStyles,
        "character": characterStyles,
        "table": tableStyles,
        "numbering": numberingStyles
    };

    root.getElementsByTagName("w:style").forEach(function(styleElement) {
        var style = readStyleElement(styleElement);
        var styleSet = styles[style.type];

        // Per 17.7.4.17 style (Style Definition) of ECMA-376 4th edition Part 1:
        //
        // > If multiple style definitions each declare the same value for their
        // > styleId, then the first such instance shall keep its current
        // > identifier with all other instances being reassigned in any manner
        // > desired.
        //
        // For the purpose of conversion, there's no point holding onto styles
        // with reassigned style IDs, so we ignore such style definitions.

        if (styleSet && styleSet[style.styleId] === undefined) {
            styleSet[style.styleId] = style;
        }
    });

    return new Styles(paragraphStyles, characterStyles, tableStyles, numberingStyles);
}

function readStyleElement(styleElement) {
    var type = styleElement.attributes["w:type"];

    if (type === "numbering") {
        return readNumberingStyleElement(type, styleElement);
    } else {
        var styleId = readStyleId(styleElement);
        var name = styleName(styleElement);
        var pPr = styleElement.firstOrEmpty("w:pPr");
        var rPr = styleElement.firstOrEmpty("w:rPr");
        
        var styleProperties = {
            type: type,
            styleId: styleId,
            name: name,
            fontSize: null,
            font: null,
            isBold: false,
            isItalic: false,
            isUnderline: false,
            isStrikethrough: false,
            alignment: null,
            color: null
        };
        
        // Extract run properties
        var fontSizeString = rPr.firstOrEmpty("w:sz").attributes["w:val"];
        if (/^[0-9]+$/.test(fontSizeString)) {
            styleProperties.fontSize = parseInt(fontSizeString, 10) / 2;
        }
        
        styleProperties.font = rPr.firstOrEmpty("w:rFonts").attributes["w:ascii"];
        styleProperties.isBold = readBooleanElement(rPr.first("w:b"));
        styleProperties.isItalic = readBooleanElement(rPr.first("w:i"));
        styleProperties.isUnderline = readUnderline(rPr.first("w:u"));
        styleProperties.isStrikethrough = readBooleanElement(rPr.first("w:strike"));
        styleProperties.alignment = pPr.firstOrEmpty("w:jc").attributes["w:val"];
        
        var colorElement = rPr.firstOrEmpty("w:color");
        if (colorElement.attributes["w:val"]) {
            styleProperties.color = colorElement.attributes["w:val"];
        }
        
        return styleProperties;
    }
}

function readUnderline(element) {
    if (element) {
        var value = element.attributes["w:val"];
        return value !== undefined && value !== "false" && value !== "0" && value !== "none";
    } else {
        return false;
    }
}

function readBooleanElement(element) {
    if (element) {
        var value = element.attributes["w:val"];
        return value !== "false" && value !== "0";
    } else {
        return false;
    }
}

function styleName(styleElement) {
    var nameElement = styleElement.first("w:name");
    return nameElement ? nameElement.attributes["w:val"] : null;
}

function readNumberingStyleElement(type, styleElement) {
    var styleId = readStyleId(styleElement);

    var numId = styleElement
        .firstOrEmpty("w:pPr")
        .firstOrEmpty("w:numPr")
        .firstOrEmpty("w:numId")
        .attributes["w:val"];

    return {type: type, numId: numId, styleId: styleId};
}

function readStyleId(styleElement) {
    return styleElement.attributes["w:styleId"];
}
