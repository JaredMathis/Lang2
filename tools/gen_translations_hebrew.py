import xml.etree.ElementTree as ET
from common import *

# Parse the XML document
tree = ET.parse('tools/bible/interlinear/StrongHebrewG.xml')
root = tree.getroot()

# Iterate over the root element's children
words = {}
for child in root:
    if child.tag == '{http://www.bibletechnologies.net/2003/OSIS/namespace}osisText':
        for child2 in child:
            if child2.tag == '{http://www.bibletechnologies.net/2003/OSIS/namespace}div' and child2.get('type') == 'glossary':
                for word in child2:
                    word_result = {}
                    for prop in word:
                        if prop.tag.endswith("}w"):
                            word_result["word"] = prop.get('lemma')
                            word_result["transliteration"] = prop.get('xlit') 
                            n = word.get("n")
                            assert type(n) == str
                            assert len(n) >= 1                   
                            words[n] = word_result
                        elif prop.tag.endswith('}note') and prop.get('type') == "translation":
                            word_result["definition"] = prop.text
file_json_write('bucket/translations/he_en.json', words)