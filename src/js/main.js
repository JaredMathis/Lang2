import {document_get} from 'py/document_get';
var b, tag_name;
tag_name = "b";
b = document_get().createElement(tag_name);
b.innerHTML = "hello";
document_get().body.appendChild(b);

//# sourceMappingURL=main.js.map
