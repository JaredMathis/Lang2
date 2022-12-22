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
        def on_click_get(c=choice):
            def on_click_choice(ev):
                chooser.remove()
                on_choice(c)
            return on_click_choice
        b = element_button(label_get(choice), on_click_get())
        chooser <= b
    return chooser

def name_get(x):
    return x["name"]

def print_me(x):
    print(x)
    return x

def on_choose_language(ev):
    main_choices = [{
        "name":"Home",
        "choose": home
    }, {
        "name":"Learn",
        "choose": on_learn
    }, {
        "name":"Read",
        "choose": lambda:None
    },]
    document <= element_chooser(
        main_choices, 
        name_get, 
        lambda c:c["choose"]())

mistakes = []

def on_learn():
    print('here on learn')


languages = [{
    "name": "Spanish",
}]

def home():
    document <= element_chooser(
        languages, 
        name_get, 
        on_choose_language)

home()
