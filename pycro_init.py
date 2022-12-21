from pycro_common import *

gitignore = '.gitignore'
lines = [
    'node_modules',
    '__pycache__',
]
git_command(lambda: file_create_if_no_exists(gitignore, """"""))
for line in lines:
    file_append_if_not_exists(gitignore, line)

directories = [
    './src',
    './src/js',
    './src/py',
    './dist'
]
for d in directories:
    dir_create_if_not_exists(d)

system_commands([
    'C:\Python310\python.exe -m pip install --upgrade pip',
    'pip install javascripthon',
    # 'npm cache clean -f',
    # 'npm install -g n',
    # 'npm install -g npm@latest',
    'npm i webpack -D',
    'npm install -D webpack-cli',
], git_acp)
