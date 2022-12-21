import datetime
import os
import inspect


def system_command(command):
    print(os.system(command))

def system_commands(commands, after_each=None):
    for c in commands:
        system_command(c)
        if after_each != None:
            after_each(c)

def git_acp(message):
    system_commands([
        'git add *',
        f'git commit -m "{datetime.datetime.now()} {message}"',
        'git push',
    ])

def file_create_if_no_exists(my_path, contents_init):
    if os.path.exists(my_path):
        return
    else:
        f = open(my_path, 'w')
        f.write(contents_init)
        return True

def git_command(fun):
    source = inspect.getsource(fun)
    if (fun()):
        git_acp(source)
    else:
        print(f'{source} returned False')

git_command(lambda: file_create_if_no_exists('.gitignore', """node_modules"""))

def dir_create_if_not_exists(my_path):
    if os.path.exists(my_path):
        return
    else:
        os.makedirs(my_path)

directories = [
    './src',
    './src/js',
    './src/py',
]
for d in directories:
    dir_create_if_not_exists(d)

system_commands([
    'C:\Python310\python.exe -m pip install --upgrade pip',
    'pip install javascripthon',
    # 'npm cache clean -f',
    # 'npm install -g n',
    # 'npm install -g npm@latest',
    'npm i webpack -D'
], git_acp)
