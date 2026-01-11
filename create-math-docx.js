const { Document, Paragraph, TextRun, Math, Packer } = require('docx');
const fs = require('fs');

// Create a new document
const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun("Single variable calculus formulas: "),
                        new Math("A = \u03C0r^2"),
                        new TextRun(" (area of a circle)"),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun("Derivative of sin(x): "),
                        new Math("\u2202/\u2202x sin(x) = cos(x)"),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun("Quadratic formula: "),
                        new Math("x = \u00B1 \u221A(b^2 - 4ac) / 2a"),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun("Integral of x^n: "),
                        new Math("\u222B x^n dx = x^(n+1)/(n+1) + C"),
                    ],
                }),
            ],
        },
    ],
});

// Save the document
docx.Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync('math-formulas.docx', buffer);
    console.log('Document saved successfully!');
});
