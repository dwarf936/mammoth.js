exports.readStylesXml = readStylesXml;
exports.Styles = Styles;
exports.defaultStyles = new Styles({}, {});

function Styles(paragraphStyles, characterStyles, tableStyles, numberingStyles) {
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
        getParagraphStyles: function() {
            return paragraphStyles;
        },
        getCharacterStyles: function() {
            return characterStyles;
        },
        getTableStyles: function() {
            return tableStyles;
        },
        getNumberingStyles: function() {
            return numberingStyles;
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
        var properties = {};
        
        // Read paragraph properties
        var pPrElement = styleElement.firstOrEmpty("w:pPr");
        if (pPrElement) {
            properties.alignment = pPrElement.firstOrEmpty("w:jc").attributes["w:val"];
            properties.indent = readParagraphIndent(pPrElement.firstOrEmpty("w:ind"));
        }
        
        // Read run properties
        var rPrElement = styleElement.firstOrEmpty("w:rPr");
        if (rPrElement) {
            var fontSizeString = rPrElement.firstOrEmpty("w:sz").attributes["w:val"];
            var fontSize = /^[0-9]+$/.test(fontSizeString) ? parseInt(fontSizeString, 10) / 2 : null;
            
            properties.font = rPrElement.firstOrEmpty("w:rFonts").attributes["w:ascii"];
            properties.fontSize = fontSize;
            properties.isBold = readBooleanElement(rPrElement.first("w:b"));
            properties.isItalic = readBooleanElement(rPrElement.first("w:i"));
            properties.isUnderline = readUnderline(rPrElement.first("w:u"));
            properties.isStrikethrough = readBooleanElement(rPrElement.first("w:strike"));
            properties.isAllCaps = readBooleanElement(rPrElement.first("w:caps"));
            properties.isSmallCaps = readBooleanElement(rPrElement.first("w:smallCaps"));
            properties.highlight = readHighlightValue(rPrElement.firstOrEmpty("w:highlight").attributes["w:val"]);
            properties.verticalAlignment = rPrElement.firstOrEmpty("w:vertAlign").attributes["w:val"];
        }
        
        return {type: type, styleId: styleId, name: name, properties: properties};
    }
}

function readParagraphIndent(element) {
    return {
        start: element.attributes["w:start"] || element.attributes["w:left"],
        end: element.attributes["w:end"] || element.attributes["w:right"],
        firstLine: element.attributes["w:firstLine"],
        hanging: element.attributes["w:hanging"]
    };
}

function readBooleanElement(element) {
    if (element) {
        var value = element.attributes["w:val"];
        return value !== "false" && value !== "0";
    } else {
        return false;
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

function readHighlightValue(value) {
    if (!value || value === "none") {
        return null;
    } else {
        return value;
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
