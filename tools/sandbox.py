from google.cloud import translate
import os

os['GOOGLE_APPLICATION_CREDENTIALS'] = 'gitignore/key.json'

# Initialize Translation client
def translate_text(text, source_language_code, target_language_code):
    """Translating Text."""

    client = translate.TranslationServiceClient()

    project_id = 'peaceful-garden-346121'
    location = 'global'

    parent = f"projects/{project_id}/locations/{location}"

    # Translate text from English to French
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

    # Display the translation for each input text provided
    for translation in response.translations:
        print("Translated text: {}".format(translation.translated_text))

translate_text("hello", "en-US", "fr")