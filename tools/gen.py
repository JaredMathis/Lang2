import os
from common import *
import json

from gcloud import *
from narakeet import narakeet_tts

update_languages_json = True

filter_letters = ".,:;¿?()\xad![]\n01\""

target_language_code = "en"

if update_languages_json:
    file_json_write(os.path.join('bucket', 'languages.json'), languages)
    exit()
    
for l in languages:
    letters = {}
    language_words = []
    language_path_bible = l["path"]["bible"]
    language_code = l["code"]
    translations_path = f'bucket/translations/{language_code}_{target_language_code}.json'
    if os.path.exists(translations_path):
        translations = file_json_read(translations_path)
    else:
        translations = {}
    path = os.path.join(path_bible_versions_public, language_path_bible)
    bible_index = file_json_read(os.path.join(path, "index.json"))
    min_found = False
    max_found = False
    for dir in os.listdir(path):
        if not dir.isnumeric():
            continue
        if len(bible_version_books) >= 1 and dir not in bible_version_books:
            continue

        book_name = bible_index[dir.lstrip('0')]["name"]
        if book_name == l["bible"]["min"]:
            min_found = True
        if book_name == l["bible"]["max"]:
            max_found = True

        if not min_found:
            continue

        print(l["name"], book_name)

        book_path = os.path.join(path, dir)
        for dir in os.listdir(book_path):
            if len(bible_version_chapters) >= 1 and dir not in bible_version_chapters:
                continue

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
                        if not word in language_words:
                            words = [t["token"]]
                            if (word in translations):
                                words.append(translations[word]["word"])
                            for w in words:
                                for r in ["*"]:
                                    w = w.replace(r, '')
                                if l["gcloud_tts"]:
                                    gcloud_tts(w, l["gcloud_code"])
                                if l["narakeet"]["tts"]:
                                    narakeet_tts(w, l["code"], l["narakeet"]["voice"])
                            for letter in w:
                                letters[letter] = True
        if max_found:
            break

    print(''.join(letters.keys()))

    language_name = l["name"]
    if False:
        file_json_write(os.path.join('bucket', 'words', language_name + '.json'), language_words)
    print(len(language_words), l["name"])

    if False:
        if l["gcloud_translate"]:
            for word in language_words:
                if word in translations:
                    continue
                translations[word] = gcloud_translate(word, language_code, target_language_code)

            file_json_write(translations_path, translations)



