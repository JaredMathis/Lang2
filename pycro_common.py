import datetime
import os
import inspect

def system_command(command, after_each=None):
    print(os.system(command))
    if after_each != None:
        after_each(command)

def system_commands(commands, after_each=None):
    for c in commands:
        system_command(c, after_each)

def git_acp(message):
    system_commands([
        'git add *',
        f'git commit -m "{datetime.datetime.now()} {message}"',
        'git push',
    ])

def file_create_if_no_exists(my_path, contents_init):
    if os.path.exists(my_path):
        return False
    f = open(my_path, 'w')
    f.write(contents_init)
    f.close()
    return True

def file_append_if_not_exists(my_path, line):
    f = open(my_path, 'r')
    lines = f.readlines()
    f.close()
    if line in lines:
        return False
    f = open(my_path, 'a')
    lines.append(line)
    f.writelines(lines)
    f.close()
    return True

def git_command(fun):
    source = inspect.getsource(fun)
    if (fun()):
        git_acp(source)
    else:
        print(f'{source} returned False')

def dir_create_if_not_exists(my_path):
    if os.path.exists(my_path):
        return
    else:
        os.makedirs(my_path)