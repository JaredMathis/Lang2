import xml.etree.ElementTree as ET

# Parse the XML document
tree = ET.parse('tools/bible/interlinear/strongsgreek.xml')
root = tree.getroot()

# Iterate over the root element's children
for child in root:
    if child.tag == 'entries':
        for child in child:
            print(child)