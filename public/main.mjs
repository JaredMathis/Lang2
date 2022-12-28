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

let language_current;
let language_current_words;

async function screen_language() {
    element_clear(document.body);
    button(document.body, "Home", ev => screen_main());
    button(document.body, "Learn", ev => screen_learn());
    button(document.body, "Read", ev => screen_read());
    let name = language_current["name"];
    language_current_words = await http_get(file_path_get("words%2F" + name + ".json"));
    console.log(language_current_words);
}

function screen_home_non(back_on_click) {
    element_clear(document.body);
    button(document.body, "Home", ev => screen_main())
    button(document.body, "Back", ev => back_on_click())
}

async function screen_read() {
    screen_home_non(screen_language);
    button(document.body, "TODO")
}

let word_group_sizes = [
    100,
    25,
    5
]
let depth_current = 0;

async function screen_learn() {
    screen_home_non(screen_language);
    button(document.body, "All");
    console.log(language_current)
}

async function screen_todo() {
    screen_home_non();
    button(document.body, "TODO")
}

function element_clear(element) {
    element.innerHTML = '';
}

function screen_main() {
    element_clear(document.body);
    for (let l of languages) {
        button(document.body, l["name"], ev => {
            language_current = l;
            screen_language();
        })
    }
}

screen_main()