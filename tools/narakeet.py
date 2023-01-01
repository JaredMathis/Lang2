from common import file_json_read
from gcloud import file_path_audio
import os

api_key = file_json_read('./gitignore/narakeet-api-client.json')["api_key"]

def narakeet_tts(text, language_code, voice):
    args = [text,language_code,voice]
    for a in args:
        assert type(a) == str
    file_name_string, file_name_string_exists = file_path_audio(text, language_code)
    if (file_name_string_exists):
        return
    
    command =  f"""npx narakeet-api-client --api-key {api_key} \
 --project-type audio \
 --script "{text}" \
 --output-type mp3 \
 --voice {voice} \
 --output {file_name_string}"""

    print(os.popen(command).read())

    exit()