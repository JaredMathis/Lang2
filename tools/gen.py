import os
from languages import *
import json

path_bible_versions = os.path.join('..', 'BibleVersions')
path_bible_versions_public = os.path.join(path_bible_versions, 'public')

filter_letters = ".,:;¿?()\xad![]\n01\""

for l in languages:
    letters = {}
    words = {}
    path = os.path.join(path_bible_versions_public, l["path"]["bible"])
    for dir in os.listdir(path):
        if dir.isnumeric():
            book_path = os.path.join(path, dir)
            for dir in os.listdir(book_path):
                chapter_path = os.path.join(book_path, dir)
                with open(chapter_path, 'r', encoding="utf-8") as f:
                    parsed = json.load(f)
                    for p in parsed:
                        for t in p["tokens"]:
                            for r in filter_letters:
                                t = t.replace(r, '').lower()
                            words[t] = True
                            for l in t:
                                letters[l] = True
    print(letters.keys())
    print(len(words))


