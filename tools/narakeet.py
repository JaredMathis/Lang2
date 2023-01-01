from tools.gcloud import file_path_audio


def narakeet_tts(text, language_code):
    file_name_string, file_name_string_exists = file_path_audio(text, language_code)
    if (file_name_string_exists):
        return