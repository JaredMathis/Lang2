import os
from common import *
import json

from gcloud import *

filter_letters = ".,:;¿?()\xad![]\n01\""

target_language_code = "en"

file_json_write(os.path.join('bucket', 'languages.json'), languages)

for l in languages:
    letters = {}
    words = []
    language_path_bible = l["path"]["bible"]
    language_code = l["code"]
    translations_path = f'bucket/translations/{language_code}_{target_language_code}.json'
    if os.path.exists(translations_path):
        translations = file_json_read(translations_path)
    else:
        translations = {}
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
                            if (type(t) != str):
                                word = t["strong"]
                            else:
                                word = t
                                word = word.lower()
                                for r in filter_letters:
                                    word = word.replace(r, '')
                            if not word in words:
                                words.append(word)
                                if l["gcloud_tts"]:
                                    gcloud_tts(translations[word]["word"], l["gcloud_code"])
                            for letter in word:
                                letters[letter] = True
    print(''.join(letters.keys()))

    language_name = l["name"]
    file_json_write(os.path.join('bucket', 'words', language_name + '.json'), words)

    if l["gcloud_translate"]:
        for word in words:
            if word in translations:
                continue
            translations[word] = gcloud_translate(word, language_code, target_language_code)

        file_json_write(translations_path, translations)



