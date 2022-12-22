from browser import *

def element_full_width(b):
    b.style.width = '100%'

def element_button(text, on_click):
    b = html.BUTTON(text)
    element_full_width(b)
    b.bind("click", on_click)
    return b

languages = [{
    "name": "Spanish"
}]

language_chooser = html.DIV()
document <= language_chooser 

for l in languages:
    def on_click_language(ev):
        language_chooser["hidden"] = "true"
    b = element_button(l["name"], on_click_language)
    language_chooser <= b 