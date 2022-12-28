import json
import os


bible_version_books = ["59"]

path_bible_versions = os.path.join('..', 'BibleVersions')
path_bible_versions_public = os.path.join(path_bible_versions, 'public')

languages = [{
    "name": "Spanish",
    "path": {
        "bible": "wordproject/sp"
    },
    "code": "es",
}]

def json_to(result):
    j = json.dumps(result, ensure_ascii=False, indent=4)
    return j

def file_json_write(path, object):
    with open(path, 'w', encoding="utf-8") as f:
        f.write(json_to(object))

def file_json_read(path):
    with open(path, 'r', encoding="utf-8") as f:
        return json.loads(f.read())

