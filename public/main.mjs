function button(parent, text, on_click) {
    let b = document.createElement("BUTTON");
    b.innerHTML = text;
    b.style["width"] = "100%";
    b.style["font-size"] = "5vh";
    b.style["font-family"] = "Sans-Serif";
    b.style["border-radius"] = "2vh";
    let margin = "0.2";
    b.style["margin"] = `${margin}vh 0 ${margin}vh`;
    b.addEventListener("click", on_click);
    parent.appendChild(b);
}

function file_path_get(name) {
    let file_path = "https://firebasestorage.googleapis.com/v0/b/wlj-lang.appspot.com/o/" + name  + "?alt=media";
    console.log(file_path);
    return file_path;
}

function http_get(url) {
    return fetch(url).then(r => r.json())
}

let languages = await http_get(file_path_get("languages.json"))

async function screen_language(language_current) {
    let name = language_current["name"];
    let words = await http_get(file_path_get("words%2F" + name + ".json"));
    console.log(words);
}

for (let l of languages) {
    button(document.body, l["name"], ev => screen_language(l))
}
    
