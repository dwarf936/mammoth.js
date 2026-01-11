from docx import Document
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml

# Create a new document
doc = Document()

# Add a paragraph with a math formula
p = doc.add_paragraph('The formula for the area of a circle is: ')

# Add OMML math formula (A = πr²)
mathml = parse_xml('''
<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr><w:noProof/></w:rPr>
    <m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">
        <m:r>
            <m:t>A</m:t>
        </m:r>
        <m:r>
            <m:t>=</m:t>
        </m:r>
        <m:r>
            <m:t>π</m:t>
        </m:r>
        <m:r>
            <m:t>r</m:t>
        </m:r>
        <m:sup>
            <m:r>
                <m:t>2</m:t>
            </m:r>
        </m:sup>
    </m:oMath>
</w:r>
''')

p._element.append(mathml)

# Save the document
doc.save('math-formula.docx')

print('Document saved as math-formula.docx')
