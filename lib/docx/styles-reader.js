exports.readStylesXml = readStylesXml;
exports.Styles = Styles;
exports.defaultStyles = new Styles({}, {});

function Styles(paragraphStyles, characterStyles, tableStyles, numberingStyles) {
    paragraphStyles = paragraphStyles || {};
    characterStyles = characterStyles || {};
    tableStyles = tableStyles || {};
    numberingStyles = numberingStyles || {};
    
    var allStyles = [];
    
    // Collect all styles
    Object.keys(paragraphStyles).forEach(function(key) {
        allStyles.push(paragraphStyles[key]);
    });
    Object.keys(characterStyles).forEach(function(key) {
        allStyles.push(characterStyles[key]);
    });
    Object.keys(tableStyles).forEach(function(key) {
        allStyles.push(tableStyles[key]);
    });
    Object.keys(numberingStyles).forEach(function(key) {
        allStyles.push(numberingStyles[key]);
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
            return allStyles.find(function(style) {
                return style.name === styleName;
            });
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
        var properties = readStyleProperties(styleElement);
        return {type: type, styleId: styleId, name: name, properties: properties};
    }
}

function readStyleProperties(styleElement) {
    var properties = {};
    
    var rPr = styleElement.firstOrEmpty("w:rPr");
    if (rPr) {
        var fontSizeString = rPr.firstOrEmpty("w:sz").attributes["w:val"];
        properties.fontSize = /^[0-9]+$/.test(fontSizeString) ? parseInt(fontSizeString, 10) / 2 : null;
        
        properties.font = rPr.firstOrEmpty("w:rFonts").attributes["w:ascii"];
        properties.isBold = readBooleanElement(rPr.first("w:b"));
        properties.isItalic = readBooleanElement(rPr.first("w:i"));
        properties.isStrikethrough = readBooleanElement(rPr.first("w:strike"));
        
        var color = rPr.firstOrEmpty("w:color").attributes["w:val"];
        if (color) {
            properties.color = color.startsWith("#") ? color : "#" + color;
        }
    }
    
    var pPr = styleElement.firstOrEmpty("w:pPr");
    if (pPr) {
        properties.alignment = pPr.firstOrEmpty("w:jc").attributes["w:val"];
    }
    
    return properties;
}

function readBooleanElement(element) {
    if (!element) {
        return false;
    }
    var value = element.attributes["w:val"];
    return value === undefined || readBooleanAttributeValue(value);
}

function readBooleanAttributeValue(value) {
    return value !== "0" && value !== "false";
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
