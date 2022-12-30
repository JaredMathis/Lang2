
let languages = await http_get(file_path_get("languages.json"))

let language_current;
let language_current_words;
let language_current_definitions;
let bible_index;
let book_index_key;
let book_index_value;
let selected_chapter;
let word_group_sizes = [
    100,
    50,
    25,
    5
]
let depth_current = 0;
let learn_choice_stack = [];
let words_to_play;
let max_choices = 4;
let mistakes = [];
let chapter_json;
let blue = '00e';

let target_language_code = "en";

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


async function screen_home() {
    depth_current = 0;
    learn_choice_stack.length = 0;
    element_clear(document.body);
    button(document.body, "Back", ev => screen_choose_chapter());
    button(document.body, "Learn", ev => screen_learn());
    if (mistakes.length > 0) {
        button(document.body, "Mistakes", ev => screen_mistakes());
    }
    button(document.body, "Read", ev => screen_read_chapter());
    learn_choice_stack = [{low: 1, high: language_current_words.length}]
}

function screen_home_non(back_on_click) {
    element_clear(document.body);
    button(document.body, "Home", ev => screen_home())
    button(document.body, "Back", ev => back_on_click())
}

function screen_base(back_on_click) {
    element_clear(document.body);
    button(document.body, "Back", ev => back_on_click())
}


async function screen_choose_book() {
    screen_base(screen_main);
    let min_found = false;
    let max_found = false;
    for (let key in bible_index) {
        let book_index = bible_index[key];
        if (book_index.name === language_current.bible.min) {
            min_found = true;
        }
        if (min_found && !max_found) {
            button(document.body,book_index.name, () => {
                book_index_key = key;
                book_index_value = book_index;
                screen_choose_chapter();
            });
        }
        if (book_index.name === language_current.bible.max) {
            max_found = true;
        }
    }
}


async function screen_choose_chapter() {
    screen_base(screen_choose_book);
    for (let chapter of book_index_value.chapters) {
        button(document.body, chapter, async () => {
            selected_chapter = chapter;
            chapter_json = await bible_chapter_get(language_current.path.bible, book_index_key, selected_chapter);
            language_current_words = [];
            for (let verse of chapter_json) {
                for (let token of verse.tokens) {
                    let {strong} = token;
                    if (!language_current_words.includes(strong)) {
                        language_current_words.push(strong)
                    }
                }
            }
            console.log({language_current_words})
            screen_home();
        });
    }
}

function style_bible_word(element) {
    element.style['font-weight'] = '600';
    element.style['color'] = blue;
}

async function screen_read_chapter(){
    screen_base(() =>  screen_home());
    let chapter_english = await bible_chapter_get("berean", book_index_key, selected_chapter);
    for (let verse of chapter_json) {
        let english_version = chapter_english.filter(v => v.verse === verse.verse)[0];
        let verse_element = text(document.body, '');
        let verse_element_original = text(verse_element, '');
        verse_element_original.dir = language_current.direction;
        let verse_number = span(verse_element_original, verse.verse);
        verse_number.style['font-weight'] = '600';
        for (let token of verse.tokens) {
            span(verse_element_original, ' ');
            let translated = span(verse_element_original, token.token);
            style_bible_word(translated);
            click(translated, translation_display_toggle)
            span(verse_element_original, ' ');
            let translation = span(verse_element_original, '');
            translation.dir = 'ltr';
            translation.style['font-weight'] = '100';
            translation.hidden = true;
            let translation1 = span(translation, token.translation + " ")
            translation1.style['font-style'] = 'italic';
            translation1.style['font-size'] = "4.5vh";
            translation.style['font-weight'] = '400';
            if (language_current_definitions[token.strong]) {
                let translation2 = span(translation, language_current_definitions[token.strong]["word"])
                click(translation2, async () => {
                    await audio_play(language_current["gcloud_code"], language_current_definitions[token.strong]["word"])
                })
                translation2.style['font-size'] = "4.5vh";
                translation2.style.opacity = '0.6';
                translation2.style.color = blue;
                let translation3 = span(translation, " " + language_current_definitions[token.strong]["definition"])
                translation3.style['font-size'] = "4.5vh";
                translation3.style.opacity = '0.6';
            }
            async function translation_display_toggle() {
                translation.hidden = !translation.hidden
                if (!translation.hidden) {
                    await audio_play(language_current["gcloud_code"], token.token)
                }
            }
        }
        let verse_element_english = text(verse_element, '');
        verse_element_english.dir = "ltr";
        verse_element_english.innerHTML = english_version.tokens.join(' ')
        verse_element_english.style['font-size'] = "4.5vh";
        verse_element_english.style.color = '#000';
        verse_element_english.style['font-style'] = 'italic';
        verse_element_english.style['font-weight'] = '400';
    }
}


async function bible_chapter_get(bible_version, book_key, chapter) {
    const padded = new Number(book_key).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    });
    console.log(padded)
    return await http_get(file_path_bible_get(`${bible_version}%2F${padded}%2F${chapter}.json`));
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


function screen_study(choice, use_mistakes) {
    let screen_back = () => use_mistakes ? screen_mistakes() : screen_pre_practice(choice);
    screen_home_non(screen_back);
    text_words_low_high(choice, use_mistakes ? "Mistakes" : "Words");
    let words = words_playable_get(choice, use_mistakes)
    for (let word of words) {
        let w= language_current_definitions[word];
        let b = button(document.body, '', async () => {
            await audio_play(language_current["gcloud_code"], w["word"])
        });
        let s = span(b, w["word"] + " : " + w["transliteration"])
        s.style.color = blue;
        span(b, " : " + w["definition"])
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
function screen_mistakes() {
    let screen_back = screen_home;
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
    let front = w => w["word"] + " : " + w["transliteration"];
    let back = w => w["definition"];
    if (Math.random() > 1/2) {
        [front, back] = [back, front]
    }
    text(document.body, front(language_current_definitions[current]));
    let choices_wrong = words_playable_shuffled_get(choice, use_mistakes).filter(w => w !== current).slice(0, max_choices - 1);

    for (let word_ of list_shuffle([current].concat(choices_wrong))) {
        let word = word_;
        let b = button(document.body, back(language_current_definitions[word]), async () => {
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
            screen_home();
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

function screen_main() {
    element_clear(document.body);
    for (let l of languages) {
        button(document.body, l["name"], async ev => {
            language_current = l;
            language_current_definitions = await http_get(file_path_get("translations%2F" + language_current["code"] + `_${target_language_code}.json`));
            bible_index = await http_get(file_path_bible_index_get('bsb'))
            screen_choose_book();
        })
    }
}

screen_main()