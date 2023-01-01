from common import file_json_read
from gcloud import file_path_audio

api_key = file_json_read('./gitignore/narakeet-api-client.json')["api_key"]

def narakeet_tts(text, language_code, voice):
    file_name_string, file_name_string_exists = file_path_audio(text, language_code)
    if (file_name_string_exists):
        return
    
    command =  f"""narakeet-api-client --api-key {api_key} \
 --project-type audio \
 --script "{text}" \
 --output-type mp3 \
 --voice {voice} \
 --output {file_name_string}"""