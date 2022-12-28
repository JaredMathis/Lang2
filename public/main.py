from browser import document
from browser import html
import json

def button(parent, text):
    b = html.BUTTON(text)
    b.style["width"] = "100%"
    b.style["font-size"] = "5vh"
    b.style["font-family"] = "Sans-Serif"
    b.style["border-radius"] = "2vh"
    margin = "0.2"
    b.style["margin"] = f"{margin}vh 0 {margin}vh"
    parent <= b


file_path = "https://firebasestorage.googleapis.com/v0/b/wlj-lang.appspot.com/o/languages.json?alt=media&"
languages = json.load(open(file_path))

for l in languages:
    button(document, l["name"])