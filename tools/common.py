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