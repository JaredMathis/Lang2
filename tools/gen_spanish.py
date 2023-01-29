from common import file_json_read
from common import file_json_write

file_paths= [
    'bucket/translations/es_en.json',
    'bucket/roots/es.json'
]
for file_path in file_paths:
    data = file_json_read(file_path)
    file_json_write(file_path, data)