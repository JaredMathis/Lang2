import os
from languages import *

path_bible_versions = os.path.join('..', 'BibleVersions')
path_bible_versions_public = os.path.join(path_bible_versions, 'public')

for l in languages:
    path = os.path.join(path_bible_versions_public, l["path"]["bible"])
    for dir in os.listdir(path):
        if dir.isnumeric():
            book_path = os.path.join(path, dir)
            for dir in os.listdir(book_path):
                chapter_path = os.path.join(book_path, dir)
                print(chapter_path)


