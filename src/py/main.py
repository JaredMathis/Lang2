from document_get import document_get

tag_name = 'b'
b = document_get().createElement(tag_name)
b.innerHTML = 'hello'
document_get().body.appendChild(b)