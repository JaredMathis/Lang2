from browser import document
from browser import html
import json

def button(parent, text):
    parent <= html.BUTTON(text)


file_path = "https://firebasestorage.googleapis.com/v0/b/wlj-lang.appspot.com/o/languages.json?alt=media&"
languages = json.load(open(file_path))

for l in languages:
    button(document, l["name"])