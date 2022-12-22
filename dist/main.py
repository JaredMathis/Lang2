from browser import *

def element_full_width(b):
    b.style.width = '100%'

def element_button(text, on_click):
    b = html.BUTTON(text)
    element_full_width(b)
    b.bind("click", on_click)
    return b

def element_chooser(choices, label_get, on_choice):
    chooser = html.DIV()
    for choice in choices:
        def on_click_choice(ev):
            chooser.remove()
            on_choice(choice)
        b = element_button(label_get(choice), on_click_choice)
        chooser <= b
    return chooser

languages = [{
    "name": "Spanish"
}]

document <= element_chooser(languages, lambda c:c["name"], lambda c:None)