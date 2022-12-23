from google.cloud import translate
import os

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

print(gcloud_translate("hello", "en-US", "fr"))