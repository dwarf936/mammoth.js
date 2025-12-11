var documents = require("../lib/documents");

// Create a document with styles
var styles = {
    findStyleByName: function(name) {
        if (name.toLowerCase() === "heading 1") {
            return {
                properties: {
                    fontSize: 16,
                    isBold: true,
                    font: "Arial",
                    color: "FF0000",
                    alignment: "center"
                },
                name: "Heading 1",
                type: "paragraph",
                styleId: "Heading1"
            };
        } else if (name.toLowerCase() === "风险提示") {
            return {
                properties: {
                    fontSize: 12,
                    isBold: true,
                    color: "dddddd"
                },
                name: "风险提示",
                type: "character",
                styleId: "WarningText"
            };
        }
        return null;
    },
    getAllStyles: function() {
        return {
            "heading 1": {
                properties: {
                    fontSize: 16,
                    isBold: true,
                    font: "Arial",
                    color: "FF0000",
                    alignment: "center"
                },
                name: "Heading 1",
                type: "paragraph",
                styleId: "Heading1"
            },
            "风险提示": {
                properties: {
                    fontSize: 12,
                    isBold: true,
                    color: "dddddd"
                },
                name: "风险提示",
                type: "character",
                styleId: "WarningText"
            }
        };
    }
};

var document = new documents.Document([], {styles: styles});

// Test the document methods
console.log("Testing Document with styles:");
console.log("1. getUserStyle('Heading 1'):", document.getUserStyle("Heading 1"));
console.log("2. getUserStyle('heading 1'):", document.getUserStyle("heading 1"));
console.log("3. getUserStyle('风险提示'):", document.getUserStyle("风险提示"));
console.log("4. getUserStyle('Non Existent'):", document.getUserStyle("Non Existent"));
console.log("5. getAllUserStyles():", document.getAllUserStyles());
console.log("6. Number of styles:", Object.keys(document.getAllUserStyles()).length);
