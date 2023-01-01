from google.cloud import translate
import os
import base64
from common import *

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'gitignore/key.json'

# Initialize Translation client
def gcloud_translate(text, source_language_code, target_language_code):
    """Translating Text."""

    client = translate.TranslationServiceClient()

    project_id = 'peaceful-garden-346121'
    location = 'global'

    parent = f"projects/{project_id}/locations/{location}"

    # Detail on supported types can be found here:
    # https://cloud.google.com/translate/docs/supported-formats
    response = client.translate_text(
        request={
            "parent": parent,
            "contents": [text],
            "mime_type": "text/plain",  # mime types: text/plain, text/html
            "source_language_code": source_language_code,
            "target_language_code": target_language_code,
        }
    )

    return [x for x in map(lambda t:t.translated_text, response.translations)]

# print(gcloud_translate("hello", "en-US", "fr"))


from google.cloud import texttospeech


def gcloud_tts(text, language_code):
    file_name_string, file_name_string_exists = file_path_audio(text, language_code)
    if (file_name_string_exists):
        return

    # Instantiates a client
    client = texttospeech.TextToSpeechClient()

    # Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(text=text)

    # Build the voice request, select the language code ("en-US") and the ssml
    # voice gender ("neutral")
    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code
    )

    # Select the type of audio file you want returned
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    file_write(file_name_string, response.audio_content, True)

def file_path_audio(text, language_code):
    file_name_string = os.path.join("bucket", "audio", language_code, text + '.mp3')
    file_name_string_exists = os.path.exists(file_name_string)
    return file_name_string, file_name_string_exists