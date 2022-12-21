from pycro_common import *


system_command('python -m metapensiero.pj src/py/main.py -o src/js/main.js', git_acp)
system_command('npx webpack ./src/js/main.js', git_acp)
file_create_if_no_exists('./dist/index.html', """
<html>
    <body>
        <script src="main.js"></script>
    </body>
</html>
""")
