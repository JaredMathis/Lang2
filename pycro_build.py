from pycro_common import *

files = [
    'document_get',
    'main',
]
for f in files:
    system_command(f'python -m metapensiero.pj src/py/{f}.py -o src/js/{f}.js', git_acp)
system_command('npx webpack ./src/js/main.js', git_acp)
git_command(lambda:file_create_if_no_exists('./dist/index.html', """
<html>
    <body>
        <script src="main.js"></script>
    </body>
</html>
"""))
