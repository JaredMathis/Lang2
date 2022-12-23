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
    language_path_bible = l["path"]["bible"]
    path = os.path.join(path_bible_versions_public, language_path_bible)
    for dir in os.listdir(path):
        if dir.isnumeric() and (len(books) == 0 or dir in books):
            book_path = os.path.join(path, dir)
            for dir in os.listdir(book_path):
                chapter_path = os.path.join(book_path, dir)
                with open(chapter_path, 'r', encoding="utf-8") as f:
                    parsed = json.load(f)
                    for p in parsed:
                        for t in p["tokens"]:
                            t = t.lower()
                            for r in filter_letters:
                                t = t.replace(r, '')
                            if not t in words:
                                words.append(t)
                            for letter in t:
                                letters[letter] = True
    print(''.join(letters.keys()))
    #print(words)

    language_name = l["name"]
    file_json_write(os.path.join('bucket', 'words', language_path_bible + '.json'), words)





