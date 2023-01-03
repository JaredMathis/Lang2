import xml.etree.ElementTree as ET
from common import *

# Parse the XML document
tree_greek = ET.parse('tools/bible/interlinear/strongsgreek.xml')
root_greek = tree_greek.getroot()

words_greek = {}
for child in root_greek:
    if child.tag == 'entries':
        for word in child:
            word_result = {}
            for prop in word:
                if prop.tag == "strongs":
                    words_greek[prop.text] = word_result
                elif prop.tag == "greek":
                    word_result["word"] = prop.get("unicode")

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
                    if (len([x for x in prop.itertext()]) > 1):
                        if prop.text:
                            print(prop.text)
                        for ref in prop:
                            print(ref.get('strongs'))
                            print(ref.get('language'))
                            assert ref.get('language') in ["GREEK", "HEBREW"]
                            if ref.tail:
                                print(ref.tail)
                    word_result["definition"] = "[…]".join(prop.itertext()).strip()
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

exit()
file_json_write('bucket/translations/gr_en.json', words)