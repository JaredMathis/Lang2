function button(parent, text, on_click) {
    let b = element(parent, "BUTTON", text);
    b.style["border-radius"] = "2vh";
    b.style["border"] = "0.5vh solid";
    click(b, on_click);
    return b;
}

function click(b, on) {
    b.addEventListener("click", on);
}

function element(parent, tag_name, text) {
    let b = document.createElement(tag_name.toUpperCase());
    parent.appendChild(b);
    b.innerHTML = text;
    b.style["width"] = "100%";
    b.style["font-size"] = "5vh";
    b.style["padding"] = "0.5vh";
    b.style["font-family"] = "Sans-Serif";
    let margin = "0.2";
    b.style["margin"] = `${margin}vh 0 ${margin}vh`;
    return b;
}

function text(parent, text) {
    return element(parent, 'div', text)
}
function span(parent, text) {
    let result = element(parent, 'span', text)
    return result;
}

function file_path_get(name) {
    return file_path_generic_get(name, "wlj-lang");
}

function file_path_bible_get(name) {
    return file_path_generic_get(name, "wlj-bible-versions");
}

function file_path_bible_index_get(name) {
    return file_path_bible_get(`${name}%2Findex.json`);
}

function file_path_generic_get(name, firebase_project_name) {
    let file_path = `https://firebasestorage.googleapis.com/v0/b/${firebase_project_name}.appspot.com/o/` + name  + "?alt=media";
    console.log(file_path);
    return file_path;
}

function http_get(url) {
    return fetch(url).then(r => r.json())
}

let languages = await http_get(file_path_get("languages.json"))

let language_current;
let language_current_words;
let language_current_definitions;
let bible_index;

async function screen_language() {
    depth_current = 0;
    learn_choice_stack.length = 0;
    element_clear(document.body);
    button(document.body, "Back", ev => screen_main());
    button(document.body, "Learn", ev => screen_learn());
    if (mistakes.length > 0) {
        button(document.body, "Mistakes", ev => screen_mistakes());
    }
    button(document.body, "Read", ev => screen_read());
    learn_choice_stack = [{low: 1, high: language_current_words.length}]
}

function screen_home_non(back_on_click) {
    element_clear(document.body);
    button(document.body, "Home", ev => screen_language())
    button(document.body, "Back", ev => back_on_click())
}

function screen_base(back_on_click) {
    element_clear(document.body);
    button(document.body, "Back", ev => back_on_click())
}

async function screen_read() {
    screen_base(screen_language);
    let min_found = false;
    let max_found = false;
    for (let key in bible_index) {
        let book_index = bible_index[key];
        if (book_index.name === language_current.bible.min) {
            min_found = true;
        }
        if (min_found && !max_found) {
            button(document.body,book_index.name, () => screen_read_book(key, book_index));
        }
        if (book_index.name === language_current.bible.max) {
            max_found = true;
        }
    }
}

async function screen_read_book(key, book_index) {
    screen_base(screen_read);
    for (let chapter of book_index.chapters) {
        button(document.body,chapter, () => screen_read_chapter(key, book_index, chapter));
    }
}

async function screen_read_chapter(book_key, book_index, chapter){
    screen_base(() =>  screen_read_book(book_key, book_index));
    let chapter_json = await bible_chapter_get(language_current.path.bible, book_key, chapter);
    let chapter_english = await bible_chapter_get("berean", book_key, chapter);
    for (let verse of chapter_json) {
        let english_version = chapter_english.filter(v => v.verse === verse.verse)[0];
        let verse_element = text(document.body, '');
        let verse_number = span(verse_element, verse.verse);
        verse_number.style['font-weight'] = '600';
        for (let token of verse.tokens) {
            span(verse_element, ' ');
            let translated = span(verse_element, token.token);
            translated.style['font-weight'] = '600';
            translated.style['color'] = '00e';
            click(translated, translation_display_toggle)
            span(verse_element, ' ');
            let translation = span(verse_element, token.translation + " | " + language_current_definitions[token.strong]["word"] + " | " + language_current_definitions[token.strong]["definition"]);
            translation.style.color = '#bbb';
            translation.style['font-weight'] = '100';
            translation.hidden = true;
            translation.style['font-size'] = "4.5vh";
            async function translation_display_toggle() {
                translation.hidden = !translation.hidden
                if (!translation.hidden) {
                    await audio_play(language_current["gcloud_code"], token.token)
                }
            }
        }
        let verse_element_english = text(verse_element, '');
        verse_element_english.innerHTML = english_version.tokens.join(' ')
        verse_element_english.style['font-size'] = "4.5vh";
        verse_element_english.style.color = '#333';
    }
}

let word_group_sizes = [
    200,
    100,
    50,
    25,
    5
]
let depth_current = 0;
let learn_choice_stack = [];
let words_to_play;

async function bible_chapter_get(bible_version, book_key, chapter) {
    return await http_get(file_path_bible_get(`${bible_version}%2F${book_key}%2F${chapter}.json`));
}

function words_playable_shuffled_get(choice, use_mistakes) {
    let result = words_playable_get(choice, use_mistakes);
    list_shuffle(result);
    return result;
}

function words_playable_get(choice, use_mistakes) {
    if (use_mistakes) {
        return mistakes.slice();
    }
    return language_current_words.slice(choice.low - 1, choice.high);
}

function words_to_play_generate(choice, use_mistakes) {
    words_to_play = words_playable_shuffled_get(choice, use_mistakes);
}

let max_choices = 4;

function screen_study(choice, use_mistakes) {
    let screen_back = () => use_mistakes ? screen_mistakes() : screen_pre_practice(choice);
    screen_home_non(screen_back);
    text_words_low_high(choice, use_mistakes ? "Mistakes" : "Words");
    let words = words_playable_get(choice, use_mistakes)
    for (let word of words) {
        let w= language_current_definitions[word];
        let b = button(document.body, w["word"] + ": " + w["definition"], async () => {
            await audio_play(language_current["gcloud_code"], w["word"])
        });
    }
}


function audio(audio_language_code, translated) {
    var audio = new Audio(file_path_get(`audio%2F${audio_language_code}%2F${translated}.mp3`));
    return audio;
}

function audio_play(audio_language_code, translated) {
    let a = audio(audio_language_code, translated);
    return new Promise(resolve => {
        a.play();
        a.addEventListener('ended', async () => {
            resolve();
        })
    })
}
let mistakes = [];
function screen_mistakes() {
    let screen_back = screen_language;
    screen_pre_practice_generic({
        low: 1,
        high: mistakes.length
    }, screen_back, true, "Mistakes")
    button(document.body, 'Clear', () => { mistakes.length = 0; screen_back() });
}
function screen_pre_practice(choice) {
    let screen_back = screen_learn;
    screen_pre_practice_generic(choice, screen_back, false)
}
function screen_pre_practice_generic(choice, screen_back, use_mistakes, noun) {
    screen_home_non(screen_back);

    text_words_low_high(choice, noun);
    button(document.body, 'Study', () => screen_study(choice, use_mistakes));
    button(document.body, 'Practice', () => {
        words_to_play_generate(choice, use_mistakes);
        screen_practice(choice, use_mistakes);
    });
}

function text_words_low_high(choice, noun="Words") {
    text(document.body, `${noun} ${choice.low} to ${choice.high}`);
}

function screen_practice(choice, use_mistakes) {
    let screen_back = () => use_mistakes ? screen_mistakes() : screen_pre_practice(choice);
    screen_home_non(screen_back);
    console.log(JSON.stringify(words_to_play.map(w => language_current_definitions[w])))
    let current = words_to_play.pop();
    if (!current) {
        screen_back();
        return;
    }
    let front = "word";
    let back = "definition";
    if (Math.random() > 1/2) {
        [front, back] = [back, front]
    }
    text(document.body, language_current_definitions[current][front]);
    let choices_wrong = words_playable_shuffled_get(choice, use_mistakes).filter(w => w !== current).slice(0, max_choices - 1);

    for (let word_ of list_shuffle([current].concat(choices_wrong))) {
        let word = word_;
        let b = button(document.body, language_current_definitions[word][back], async () => {
            if (word === current) {
                b.style.color = 'green'
                await audio_play(language_current["gcloud_code"], language_current_definitions[word]["word"])
                screen_practice(choice, use_mistakes);
            } else {
                b.style.color = 'red';
                for (let w of [word, current]) {
                    if (!mistakes.includes(w)) {
                        mistakes.push(w)
                    }
                }
            }
        });
    }
}

function list_shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }


function screen_learn() {
    screen_home_non(() => {
        if (depth_current <= 0) {
            screen_language();
        } else {
            depth_current--;
            learn_choice_stack.pop();
            screen_learn()
        }
    });
    let choices = screen_learn_choices_get()
    for (let choice of choices) {
        button(document.body, `Learn words ${choice.low} to ${choice.high}`, () => {
            if (learn_choice_stack.length >= word_group_sizes.length) {
                screen_pre_practice(choice);
            } else {
                depth_current++;
                learn_choice_stack.push(choice);
                screen_learn(choice);
            }
        });
    }
    let last = list_last(learn_choice_stack);
    button(document.body, `Learn all words ${last.low} to ${last.high}`, () => {
        screen_pre_practice(last);
    });
}

function list_last(list) {
    return list[list.length - 1]
}

function screen_learn_choices_get() {
    let last = list_last(learn_choice_stack);
    let word_group_size = word_group_sizes[depth_current];
    let remaining = last.high - last.low + 1;
    let result = [];
    let current = last.low;
    while (remaining > word_group_size) {
        result.push({
            low: current,
            high: current + word_group_size - 1 
        })
        current += word_group_size;
        remaining -= word_group_size;
    }
    result.push({
        low: current,
        high: current + remaining - 1
    })
    return result;
}

function screen_todo(back_on_click) {
    screen_home_non(back_on_click);
    button(document.body, "TODO")
}

function element_clear(element) {
    element.innerHTML = '';
}

let target_language_code = "en";

function screen_main() {
    element_clear(document.body);
    for (let l of languages) {
        button(document.body, l["name"], async ev => {
            language_current = l;
            let name = language_current["name"];
            language_current_words = await http_get(file_path_get("words%2F" + name + ".json"));
            language_current_definitions = await http_get(file_path_get("translations%2F" + language_current["code"] + `_${target_language_code}.json`));
            bible_index = await http_get(file_path_bible_index_get('bsb'))
            screen_language();
        })
    }
}

screen_main()