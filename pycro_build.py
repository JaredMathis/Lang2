from pycro_common import *


system_command('python -m metapensiero.pj src/py/main.py -o src/js/main.js', git_acp)
system_command('npx webpack ./src/js/main.js', git_acp)
