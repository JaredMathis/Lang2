from pycro_common import *

gitignore_only = False

gitignore = '.gitignore'
lines = [
    'node_modules',
    '__pycache__',
]
git_command(lambda: file_create_if_no_exists(gitignore, """"""))
for line in lines:
    git_command(lambda: file_append_if_not_exists(gitignore, line))

if gitignore_only:
    exit()

directories = [
    './dist'
]
for d in directories:
    dir_create_if_not_exists(d)

system_commands([
    'C:\Python310\python.exe -m pip install --upgrade pip',
    'npm i http-server -D',
], git_acp)

git_command(lambda:file_create_if_no_exists('./dist/index.html', """
<html>
    <head>
        <meta charset="utf-8">
        <script type="text/javascript"
            src="https://cdn.jsdelivr.net/npm/brython@3.11.0/brython.min.js">
        </script>
        <script type="text/javascript"
            src="https://cdn.jsdelivr.net/npm/brython@3.11.0/brython_stdlib.js">
        </script>
    </head>
    <body onload="brython()">
    <script type="text/python" src="main.py"></script>
    </body>
</html>
"""))