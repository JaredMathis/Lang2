from browser import document
import json

file_path = "https://firebasestorage.googleapis.com/v0/b/wlj-lang.appspot.com/o/languages.json?alt=media&"
languages = json.load(open(file_path))

for l in languages:
    document <= l["name"]