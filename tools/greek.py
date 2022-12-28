import xml.etree.ElementTree as ET

# Parse the XML document
tree = ET.parse('tools/bible/interlinear/strongsgreek.xml')
root = tree.getroot()

# Iterate over the root element's children
words = []
for child in root:
    if child.tag == 'entries':
        for word in child:
            word_result = {}
            words.append(word_result)
            for prop in word:
                if prop.tag == "strongs":
                    word_result["strongs"] = prop.text
            print(word_result)