from common import file_json_read
from gcloud import file_path_audio
import os

from tools.common import file_write

api_key = file_json_read('./gitignore/narakeet-api-client.json')["api_key"]

def narakeet_tts(text, language_code, voice):
    args = [text,language_code,voice]
    for a in args:
        assert type(a) == str
    file_name_string, file_name_string_exists = file_path_audio(text, language_code)
    if (file_name_string_exists):
        return

    script_text_path = "gitignore/narakeet_script_text.txt"
    file_write(script_text_path, text, cloud=False)
    
    command =  f"""npx narakeet-api-client --api-key {api_key} \
 --project-type audio \
 --script-file {script_text_path} \
 --output-type mp3 \
 --voice {voice} \
 --output {file_name_string}"""

    print(text)
    print(os.popen(command).read())

    exit()