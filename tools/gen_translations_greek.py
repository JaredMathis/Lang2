import xml.etree.ElementTree as ET
from common import *

# Parse the XML document
tree_greek = ET.parse('tools/bible/interlinear/strongsgreek.xml')
root_greek = tree_greek.getroot()

lookup = {}
lookup["GREEK"] = {}
for child in root_greek:
    if child.tag == 'entries':
        for word in child:
            word_result = {}
            for prop in word:
                if prop.tag == "strongs":
                    word_result["strongs"] = prop.text
                elif prop.tag == "greek":
                    word_result["word"] = prop.get("unicode")
            if "strongs" in word_result and "word" in word_result:
                lookup["GREEK"][word_result["strongs"]] = word_result["word"]

# Parse the XML document
tree_hebrew = ET.parse('tools/bible/interlinear/StrongHebrewG.xml')
root_hebrew = tree_hebrew.getroot()

# Iterate over the root element's children
lookup["HEBREW"] = {}
for child in root_hebrew:
    if child.tag == '{http://www.bibletechnologies.net/2003/OSIS/namespace}osisText':
        for child2 in child:
            if child2.tag == '{http://www.bibletechnologies.net/2003/OSIS/namespace}div' and child2.get('type') == 'glossary':
                for word in child2:
                    word_result = {}
                    for prop in word:
                        if prop.tag.endswith("}w"):
                            n = word.get("n")
                            assert type(n) == str
                            assert len(n) >= 1                   
                            lookup["HEBREW"][n] = prop.get('lemma')

# Iterate over the root element's children
words = {}
for child in root_greek:
    if child.tag == 'entries':
        for word in child:
            word_result = {}
            for prop in word:
                if prop.tag == "strongs":
                    words[prop.text] = word_result
                elif prop.tag == "strongs_def":
                    definition = ''
                    if prop.text:
                        definition += (prop.text)
                    for ref in prop:
                        unicode = ref.get('unicode')
                        if not unicode:
                            print(ET.tostring(ref, 'utf-8'))
                            strongs = ref.get('strongs').lstrip('0')
                            if ref.get('language'):
                                definition += (lookup[ref.get('language')][strongs])
                            else:
                                definition += (strongs)
                        if ref.tail:
                            definition += (ref.tail)
                    word_result["definition"] = definition
                elif prop.tag == "greek":
                    word_result["word"] = prop.get("unicode")
                    word_result["transliteration"] = prop.get("translit")
            if "definition" not in word_result:
                for prop in word:
                    if prop.tag == "kjv_def":
                        word_result["definition"] = prop.text.strip()
            if "definition" not in word_result:
                for prop in word:
                    if prop.tag == "strongs_derivation":
                        word_result["definition"] = prop.text.strip()

# exit()
file_json_write('bucket/translations/gr_en.json', words, cloud=False)