exports.readStylesXml = readStylesXml;
exports.Styles = Styles;
exports.defaultStyles = new Styles({}, {});

function Styles(paragraphStyles, characterStyles, tableStyles, numberingStyles) {
    // Ensure styles objects are not null or undefined
    paragraphStyles = paragraphStyles || {};
    characterStyles = characterStyles || {};
    tableStyles = tableStyles || {};
    numberingStyles = numberingStyles || {};
    
    // Create a map of all styles by name (case-insensitive)
    var allStylesByName = {};
    [].concat(Object.values(paragraphStyles), Object.values(characterStyles), Object.values(tableStyles)).forEach(function(style) {
        if (style.name) {
            allStylesByName[style.name.toLowerCase()] = style;
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
        findStyleByName: function(name) {
            return allStylesByName[name.toLowerCase()];
        },
        getAllStyles: function() {
            return allStylesByName;
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

function readStyleProperties(styleElement) {
    var properties = {};
    
    // Read run properties (w:rPr)
    var rPr = styleElement.firstOrEmpty("w:rPr");
    if (rPr) {
        // Font size (w:sz gives half points)
        var fontSizeString = rPr.firstOrEmpty("w:sz").attributes["w:val"];
        if (fontSizeString && /^[0-9]+$/.test(fontSizeString)) {
            properties.fontSize = parseInt(fontSizeString, 10) / 2;
        }
        
        // Bold (w:b)
        properties.isBold = readBooleanElement(rPr.first("w:b"));
        
        // Italic (w:i)
        properties.isItalic = readBooleanElement(rPr.first("w:i"));
        
        // Underline (w:u)
        properties.isUnderline = readUnderline(rPr.first("w:u"));
        
        // Strikethrough (w:strike)
        properties.isStrikethrough = readBooleanElement(rPr.first("w:strike"));
        
        // Font (w:rFonts)
        properties.font = rPr.firstOrEmpty("w:rFonts").attributes["w:ascii"];
        
        // Font color (w:color)
        properties.color = rPr.firstOrEmpty("w:color").attributes["w:val"];
        
        // Highlight (w:highlight)
        properties.highlight = readHighlightValue(rPr.firstOrEmpty("w:highlight").attributes["w:val"]);
    }
    
    // Read paragraph properties (w:pPr)
    var pPr = styleElement.firstOrEmpty("w:pPr");
    if (pPr) {
        // Alignment (w:jc)
        properties.alignment = pPr.firstOrEmpty("w:jc").attributes["w:val"];
        
        // Indentation (w:ind)
        var ind = pPr.firstOrEmpty("w:ind");
        if (ind) {
            properties.indent = {
                start: ind.attributes["w:start"] || ind.attributes["w:left"],
                end: ind.attributes["w:end"] || ind.attributes["w:right"],
                firstLine: ind.attributes["w:firstLine"],
                hanging: ind.attributes["w:hanging"]
            };
        }
    }
    
    return properties;
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

function readHighlightValue(value) {
    if (!value || value === "none") {
        return null;
    }
    return value;
}

function readStyleId(styleElement) {
    return styleElement.attributes["w:styleId"];
}
