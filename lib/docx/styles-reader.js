exports.readStylesXml = readStylesXml;
exports.Styles = Styles;
exports.defaultStyles = new Styles({}, {}, {}, {});

function Styles(paragraphStyles, characterStyles, tableStyles, numberingStyles) {
    var allStyles = {};
    
    // Ensure all style sets are defined
    paragraphStyles = paragraphStyles || {};
    characterStyles = characterStyles || {};
    tableStyles = tableStyles || {};
    numberingStyles = numberingStyles || {};
    
    // Combine all styles into a single lookup
    [paragraphStyles, characterStyles, tableStyles, numberingStyles].forEach(function(styleSet) {
        Object.keys(styleSet).forEach(function(styleId) {
            allStyles[styleId] = styleSet[styleId];
        });
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
        findStyleById: function(styleId) {
            return allStyles[styleId];
        },
        getAllStyles: function() {
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
        var properties = readStyleProperties(styleElement);
        return {
            type: type,
            styleId: styleId,
            name: name,
            properties: properties
        };
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

    var properties = readStyleProperties(styleElement);
    return {type: type, numId: numId, styleId: styleId, properties: properties};
}

function readStyleProperties(styleElement) {
    var properties = {};
    
    // Read run properties (rPr) for character formatting
    var rPr = styleElement.first("w:rPr");
    if (rPr) {
        properties.runProperties = readRunProperties(rPr);
    }
    
    // Read paragraph properties (pPr) for paragraph formatting
    var pPr = styleElement.first("w:pPr");
    if (pPr) {
        properties.paragraphProperties = readParagraphProperties(pPr);
    }
    
    // Read table properties (tblPr) for table formatting
    var tblPr = styleElement.first("w:tblPr");
    if (tblPr) {
        properties.tableProperties = readTableProperties(tblPr);
    }
    
    return properties;
}

function readRunProperties(rPr) {
    var runProps = {};
    
    // Bold
    var bold = rPr.first("w:b");
    if (bold) {
        runProps.bold = bold.attributes["w:val"] !== "false" && bold.attributes["w:val"] !== "0";
    }
    
    // Italic
    var italic = rPr.first("w:i");
    if (italic) {
        runProps.italic = italic.attributes["w:val"] !== "false" && italic.attributes["w:val"] !== "0";
    }
    
    // Underline
    var underline = rPr.first("w:u");
    if (underline) {
        runProps.underline = underline.attributes["w:val"] !== "false" && underline.attributes["w:val"] !== "0";
        if (underline.attributes["w:val"] && underline.attributes["w:val"] !== "true") {
            runProps.underlineType = underline.attributes["w:val"];
        }
    }
    
    // Strikethrough
    var strikethrough = rPr.first("w:strike");
    if (strikethrough) {
        runProps.strikethrough = strikethrough.attributes["w:val"] !== "false" && strikethrough.attributes["w:val"] !== "0";
    }
    
    // Font size (in half-points)
    var sz = rPr.first("w:sz");
    if (sz && sz.attributes["w:val"]) {
        runProps.fontSize = parseInt(sz.attributes["w:val"], 10) / 2; // Convert to points
    }
    
    // Font color
    var color = rPr.first("w:color");
    if (color && color.attributes["w:val"]) {
        runProps.color = color.attributes["w:val"];
    }
    
    // Highlight color
    var highlight = rPr.first("w:highlight");
    if (highlight && highlight.attributes["w:val"]) {
        runProps.highlight = highlight.attributes["w:val"];
    }
    
    // Font family
    var rFonts = rPr.first("w:rFonts");
    if (rFonts) {
        runProps.fontFamily = rFonts.attributes["w:ascii"] || rFonts.attributes["w:hAnsi"];
    }
    
    return runProps;
}

function readParagraphProperties(pPr) {
    var paraProps = {};
    
    // Alignment
    var jc = pPr.first("w:jc");
    if (jc && jc.attributes["w:val"]) {
        paraProps.alignment = jc.attributes["w:val"];
    }
    
    // Spacing
    var spacing = pPr.first("w:spacing");
    if (spacing) {
        if (spacing.attributes["w:before"]) {
            paraProps.spacingBefore = parseInt(spacing.attributes["w:before"], 10);
        }
        if (spacing.attributes["w:after"]) {
            paraProps.spacingAfter = parseInt(spacing.attributes["w:after"], 10);
        }
        if (spacing.attributes["w:line"]) {
            paraProps.lineSpacing = parseInt(spacing.attributes["w:line"], 10);
        }
    }
    
    // Indentation
    var ind = pPr.first("w:ind");
    if (ind) {
        if (ind.attributes["w:left"]) {
            paraProps.leftIndent = parseInt(ind.attributes["w:left"], 10);
        }
        if (ind.attributes["w:right"]) {
            paraProps.rightIndent = parseInt(ind.attributes["w:right"], 10);
        }
        if (ind.attributes["w:firstLine"]) {
            paraProps.firstLineIndent = parseInt(ind.attributes["w:firstLine"], 10);
        }
    }
    
    return paraProps;
}

function readTableProperties(tblPr) {
    var tableProps = {};
    
    // Table alignment
    var jc = tblPr.first("w:jc");
    if (jc && jc.attributes["w:val"]) {
        tableProps.alignment = jc.attributes["w:val"];
    }
    
    // Table borders would be handled here if needed
    
    return tableProps;
}

function readStyleId(styleElement) {
    return styleElement.attributes["w:styleId"];
}
