import xml.etree.ElementTree as ET
from common import *

# Parse the XML document
tree = ET.parse('tools/bible/interlinear/strongsgreek.xml')
root = tree.getroot()

# Iterate over the root element's children
words = {}
for child in root:
    if child.tag == 'entries':
        for word in child:
            word_result = {}
            for prop in word:
                if prop.tag == "strongs":
                    words[prop.text] = word_result
                elif prop.tag == "strongs_def":
                    word_result["definition"] = prop.text.strip()
                elif prop.tag == "greek":
                    word_result["word"] = prop.get("unicode")
                    word_result["transliteration"] = prop.get("translit")

file_json_write('bucket/translations/gr_en.json', words)