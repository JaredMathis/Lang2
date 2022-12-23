import json


languages = [{
    "name": "Spanish",
    "path": {
        "bible": "wordproject/sp"
    }
}]

def json_to(result):
    j = json.dumps(result, ensure_ascii=False, indent=4)
    return j

def file_json_write(path, object):
    with open(path, 'w', encoding="utf-8") as f:
        f.write(json_to(object))