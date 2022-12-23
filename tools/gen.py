import os
from common import *
import json

books = ["59"]

path_bible_versions = os.path.join('..', 'BibleVersions')
path_bible_versions_public = os.path.join(path_bible_versions, 'public')

filter_letters = ".,:;¿?()\xad![]\n01\""

for l in languages:
    letters = {}
    words = []
    path = os.path.join(path_bible_versions_public, l["path"]["bible"])
    for dir in os.listdir(path):
        if dir.isnumeric() and (len(books) == 0 or dir in books):
            book_path = os.path.join(path, dir)
            for dir in os.listdir(book_path):
                chapter_path = os.path.join(book_path, dir)
                with open(chapter_path, 'r', encoding="utf-8") as f:
                    parsed = json.load(f)
                    for p in parsed:
                        for t in p["tokens"]:
                            for r in filter_letters:
                                t = t.replace(r, '').lower()
                            if not t in words:
                                words.append(t)
                            for l in t:
                                letters[l] = True
    #print(letters.keys())
    #print(words)

    with open(os.path.join('bucket', l["name"]), 'w') as f:
        f.write(json_to(words))




