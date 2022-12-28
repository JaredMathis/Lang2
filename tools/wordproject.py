import os
from common import *
import json

from gcloud import gcloud_translate

bible_version_books = ["59"]

path_bible_versions = os.path.join('..', 'BibleVersions')
path_bible_versions_public = os.path.join(path_bible_versions, 'public')

filter_letters = ".,:;¿?()\xad![]\n01\""

target_language_code = "en"

for l in languages:
    letters = {}
    words = []
    language_path_bible = l["path"]["bible"]
    language_code = l["code"]
    translations_path = f'bucket/translations/{language_code}_{target_language_code}.json'
    translations = file_json_read(translations_path)
    path = os.path.join(path_bible_versions_public, language_path_bible)
    for dir in os.listdir(path):
        if dir.isnumeric() and (len(bible_version_books) == 0 or dir in bible_version_books):
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

    language_name = l["name"]
    file_json_write(os.path.join('bucket', 'words', language_path_bible + '.json'), words)

    for word in words:
        if word in translations:
            continue
        translations[word] = gcloud_translate(word, language_code, target_language_code)

    file_json_write(translations_path, translations)



