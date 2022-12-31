import json
import os

directory_gitignore = 'gitignore'

import firebase_admin
from firebase_admin import storage
from firebase_admin import credentials

cred = credentials.Certificate(os.path.join(directory_gitignore, 'firebasecreds.json'))
firebase_admin.initialize_app(cred)

# Get a reference to the Cloud Storage bucket
bucket = storage.bucket('wlj-lang.appspot.com')

delete_firebase_blobs = False
firebase_blobs_update = True
file_json_write_first_only = False

bible_version_books = [
    # "59"
    ]

path_bible_versions = os.path.join('..', 'BibleVersions')
path_bible_versions_public = os.path.join(path_bible_versions, 'public')

languages = [{
    "name": "Greek",
    "path": {
        "bible": "bsb"
    },
    "code": "gr",
    "gcloud_translate": False,
    "gcloud_code": "el-GR",
    "bible": {
        "min": "Matthew",
        "max": "Revelation"
    },
    "gcloud_tts": True
}, {
    "name": "Hebrew",
    "path": {
        "bible": "bsb"
    },
    "code": "he",
    "gcloud_translate": False,
    "gcloud_code": "el-GR",
    "bible": {
        "min": "Genesis",
        "max": "Malachi"
    },
    "gcloud_tts": False
}]

spanish = {
    "name": "Spanish",
    "path": {
        "bible": "wordproject/sp"
    },
    "code": "es",
    "gcloud_translate": True
}

def json_to(result):
    j = json.dumps(result, ensure_ascii=False, indent=4)
    return j

def file_write(file_path, result, bytes=False, transform=None):
    # Create a new blob in the bucket
    blob = bucket.blob(file_path.replace('\\','/').replace('bucket/',''))
    if delete_firebase_blobs:
        if blob.exists():
            blob.delete()
    else:
        if transform == None:
            j = result
        else:
            j = transform(result)
        if bytes:
            with open(file_path, "wb") as out:
                # Write the response to the output file.
                out.write(j)
        else:
            with open(file_path, 'w', encoding='utf-8') as output:
                output.write(j)
        print('Wrote to file ' + file_path)
        if firebase_blobs_update:
            # Upload the file to the bucket
            blob.upload_from_filename(file_path)
        if file_json_write_first_only:
            exit()


def file_json_write(file_path, result):
    return file_write(file_path, result, False, json_to)

def file_json_read(path):
    with open(path, 'r', encoding="utf-8") as f:
        return json.loads(f.read())

