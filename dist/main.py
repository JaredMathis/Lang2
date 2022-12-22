from browser import *

def element_full_width(b):
    b.style.width = '100%'

def element_button(text):
    b = html.BUTTON(text)
    element_full_width(b)
    return b

b = element_button('L1')

document <= b 