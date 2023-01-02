
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
    b.style["border"] = "0.3vh solid";
    b.style.color = 'black';
    b.style['border-color'] = 'lightgray';
    click(b, on_click);
    return b;
}

function click(b, on) {
    b.addEventListener("click", on);
}

function element(parent, tag_name, text='') {
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
    text_book_chapter();
    button(document.body, "Read chapter", ev => screen_read_chapter());
    button(document.body, "Learn words in chapter", ev => screen_learn());
    if (mistakes.length > 0) {
        button(document.body, "Mistakes", ev => screen_mistakes());
    }
    learn_choice_stack = [{low: 1, high: language_current_words.length}]
}

function text_book_chapter() {
    text(document.body, book_index_value.name + " " + selected_chapter);
}

function screen_home_non(back_on_click) {
    element_clear(document.body);
    button(document.body, "Home", ev => screen_home());
    button(document.body, "Back", ev => back_on_click());
    text_book_chapter();
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
            let book_name_length_max = 3;
            let b = button_fifth(
                document.body,
                book_index.name.replace(' ', '').substr(0, book_name_length_max), 
                () => {
                    book_index_key = key;
                    book_index_value = book_index;
                    screen_choose_chapter();
                });
            b.style['font-size'] = '4vh';
        }
        if (book_index.name === language_current.bible.max) {
            max_found = true;
        }
    }
}

function button_fifth(parent, text, on_click) {
    let b = button(parent, text, on_click);
    b.style.width = '20%';
    return b;
}

async function screen_choose_chapter() {
    screen_base(screen_choose_book);
    text(document.body, book_index_value.name)
    for (let chapter of book_index_value.chapters) {
        button_fifth(document.body, chapter, async () => {
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
            screen_home();
        });
    }
}

function style_color_and_border(element, color) {
    element.style['color'] = color;
    element.style['border-color'] = color;
}

function style_bible_word(element, regular_weight) {
    if (!regular_weight) {
        element.style['font-weight'] = '700';
    }
    style_color_and_border(element, blue);
    if (true) {
        if (language_current_hebrew_is()) {
            element.style["line-height"] = "1";
            element.style["font-family"] = "bsthebrew";
            element.style["font-size"] = "6.5vh";
        } else {
            element.style["line-height"] = "1.2";
            element.style["font-family"] = "Gentium Book Plus";
            element.style["font-size"] = "5.5vh";
        }
    }
}
function style_bible_transliteration(element) {
    style_color_and_border(element, blue);
}

function document_scroll_to_top() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
}

async function screen_read_chapter(){
    screen_home_non(() =>  screen_home());
    let translitties = [];
    let englishes = [];
    let ltrs = [];
    let english_hide = button(document.body, 'Hide English', () => {
        englishes.forEach(e => e.hidden = true);
    });
    let english_show = button(document.body, 'Show English', () => {
        englishes.forEach(e => e.hidden = false);
    });
    let toggle_transliteration_toggled = false;
    let toggle_transliteration = button(document.body, 'Toggle transliteration', () => {
        translitties.forEach(e => e.hidden = !e.hidden);
        toggle_transliteration_toggled = !toggle_transliteration_toggled;
        if (toggle_transliteration_toggled) {
            ltrs.forEach(e => e.dir = "ltr");
        } else {
            ltrs.forEach(e => e.dir = language_current_direction_ltr_get());
        }
        console.log({ltrs});
    });
    element_two_click_toggle(english_hide, english_show);
    let choose_verse_container = element(document.body, 'div');

    let chapter_english = await bible_chapter_get("berean", book_index_key, selected_chapter);
    for (let verse of chapter_json) {
        let english_version = chapter_english.filter(v => v.verse === verse.verse)[0];
        let verse_element = text(document.body, '');
        let verse_top_button = button(verse_element, 'Top', document_scroll_to_top);
        verse_top_button.hidden = true;
        let verse_element_original = text(verse_element, '');
        verse_element_original.dir = language_current_direction_ltr_get();
        ltrs.push(verse_element_original);
        let verse_number = span(verse_element_original, verse.verse);
        button_fifth(choose_verse_container, verse.verse, () => {
            verse_element.scrollIntoView();            
        });
        verse_number.style['font-weight'] = '600';
        for (let token of verse.tokens) {
            let spacer = span(verse_element_original, ' ');
            style_bible_word(spacer);
            let translated = span(verse_element_original, '');
            let translateda = span(translated, token.token);
            translitties.push(translateda);
            let translatedb = span(translated, token.transliteration);
            translitties.push(translatedb);
            translatedb.hidden = true;
            [translateda,translatedb].forEach(t => style_bible_word(t));
            click(translated, translation_display_toggle);
            let translation = span(verse_element_original, '');
            translation.dir = 'ltr';
            translation.style['font-weight'] = '100';
            translation.hidden = true;
            let translation1 = span(translation, token.translation + " ")
            translation1.style['font-style'] = 'italic';
            translation1.style['font-size'] = "4.5vh";
            translation.style['font-weight'] = '400';
            if (language_current_definitions[token.strong]) {
                let translation2 = span(translation, '');
                let translation2a = span(translation2, language_current_definitions[token.strong]["word"]);
                translitties.push(translation2a);
                let translation2b = span(translation2, language_current_definitions[token.strong]["transliteration"]);
                translitties.push(translation2b);
                translation2b.hidden = true;
                click(translation2, async () => {
                    await audio_play_try(language_current_audio_code_get(), language_current_definitions[token.strong]["word"])
                })
                translation2.style['font-size'] = "4.5vh";
                translation2.style.opacity = '0.6';
                [translation2a,translation2b].forEach(t => style_bible_word(t, true));
                let translation3 = span(
                    translation, 
                    " " + definition_short(language_current_definitions[token.strong]["definition"]))
                translation3.style['font-size'] = "4.5vh";
                translation3.style.opacity = '0.6';
                let translation4 = span(
                    translation, 
                    " " + (language_current_definitions[token.strong]["definition"]))
                translation4.style['font-size'] = "4.5vh";
                translation4.style.opacity = '0.6';
                element_two_click_toggle(translation3, translation4);
            }
            async function translation_display_toggle() {
                translation.hidden = !translation.hidden
                if (!translation.hidden) {
                    await audio_play_try(language_current_audio_code_get(), token.token)
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
        englishes.push(verse_element_english);
    }
}

function language_current_direction_ltr_get() {
    return language_current.direction || (language_current_hebrew_is() ? "rtl" : "ltr");
}

function element_two_click_toggle(a, b) {
    b.hidden = true;
    click(a, () => {
        b.hidden = false;
        a.hidden = true;
    });
    click(b, () => {
        b.hidden = true;
        a.hidden = false;
    });

}

function language_current_audio_code_get() {
    return language_current["gcloud_code"] || language_current["code"];
}

function language_current_hebrew_is() {
    return language_current.name === "Hebrew";
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

function element_text_bible_word_transliteration(parent, w) {
    if (!w) {
        debugger;
    }
    element_text_bible_word(parent, w);
    let s3 = span(parent, " : ");
    style_bible_transliteration(s3);
    element_text_bible_transliteration(parent, w);
}

function element_text_bible_transliteration(parent, w) {
    let s2 = span(parent, w["transliteration"]);
    style_bible_transliteration(s2);
}

function element_text_bible_word(parent, w) {
    let s1 = span(parent, w["word"]);
    style_bible_word(s1);
}

function screen_study(choice, use_mistakes) {
    let screen_back = () => use_mistakes ? screen_mistakes() : screen_pre_quiz(choice);
    screen_home_non(screen_back);
    text_words_low_high(choice, use_mistakes ? "Mistakes" : "Words");
    let words = words_playable_get(choice, use_mistakes)
    for (let word of words) {
        let w= language_current_definitions[use_mistakes ? word.strong : word];
        if (!w) {
            console.log('missing word');
            continue;
        }
        let b = button(document.body, '', async () => {
            await audio_play_try(language_current_audio_code_get(), w["word"])
        });
        if (use_mistakes) {
            word.front(b);
            span(b, " : ");
            word.back(b);
        } else {
            if (no_transliteration) {
                element_text_bible_word(b, w);
            } else {
                element_text_bible_word_transliteration(b, w);
            }

            if (category_selected === category_definition) {
                span(b, " : " + (definition_short_use ? definition_short : identity)(w["definition"]));
            }
        }
    }
}

function identity(a) {
    return a;
}


function audio(audio_language_code, translated) {
    var audio = new Audio(file_path_get(`audio%2F${audio_language_code}%2F${translated}.mp3`));
    return audio;
}

async function audio_play_try(audio_language_code, translated) {
    let a = audio(audio_language_code, translated);
    await new Promise(async resolve => {
        try {
            await a.play();
            a.addEventListener('ended', async () => {
                resolve();
            })
        } catch (e) {
            resolve();
        }
    });
}
function screen_mistakes() {
    let screen_back = screen_home;
    screen_pre_quiz_generic({
        low: 1,
        high: mistakes.length
    }, screen_back, true, "Mistakes")
    button(document.body, 'Clear', () => { mistakes.length = 0; screen_back() });
}
function screen_pre_quiz(choice) {
    screen_pre_quiz_generic(choice, () => screen_category(choice), false)
}

let category_selected;
let category_transliteration = 'Transliteration';
let category_definition = 'Definition';

let no_transliteration;
let definition_short_use;

function screen_category(choice) {
    screen_home_non(screen_learn);
    text_words_low_high(choice);
    function category_definition_set(c) {
        category_selected = c
    }
    let categories = [
        { 
            label: "Word(+Transliteration) vs. Long definition", 
            action: c => { 
                category_definition_set(category_definition); 
            }
        },
        { 
            label: "Word vs. Long definition", 
            action: c => { 
                no_transliteration = true;
                category_definition_set(category_definition); 
            }
        },
        { 
            label: "Word(+Transliteration) vs. Short definition",
            action: c => { 
                definition_short_use = true;
                category_definition_set(category_definition); 
            }
        },
        {
            label: "Word vs. Short definition", 
            action: c => { 
                definition_short_use = true;
                no_transliteration = true;
                category_definition_set(category_definition); 
            }
        },
        {
            label: "Word vs. Transliteration", 
            action: category_definition_set
        }
    ]
    for (let category of categories) {
        button(document.body, category.label, () => {
            no_transliteration = false;
            definition_short_use = false;
            category.action(category.label);
            screen_pre_quiz(choice);
        });
    }
}

function screen_pre_quiz_generic(choice, screen_back, use_mistakes, noun) {
    screen_home_non(screen_back);

    text_words_low_high(choice, noun);
    button(document.body, 'Study', () => screen_study(choice, use_mistakes));
    button(document.body, 'Quiz', () => {
        words_to_play_generate(choice, use_mistakes);
        screen_quiz(choice, use_mistakes);
    });
}

function text_words_low_high(choice, noun="Words") {
    text(document.body, `${noun} ${choice.low} to ${choice.high}`);
}

function definition_short(s) {
    let threshold = 30;
    if (s.length <= threshold) {
        return s;
    }
    return parenthesis_nested_remove(s);
}

function parenthesis_nested_remove(Input) {
    var pCount = 0;
    var Output = "";
    var found_left = false;
    for (var i=0; i < Input.length; i++) {
        if (Input[i] === '(') {
            found_left = true;
            pCount++;
        }
        else if (Input[i] === ')') {
            if (found_left) {
                pCount--;
            }
        }
        else if (pCount <= 0) {
            Output += Input[i];
        }
    }
    return Output;
}

function screen_quiz(choice, use_mistakes) {
    let screen_back = () => use_mistakes ? screen_mistakes() : screen_pre_quiz(choice);
    screen_home_non(screen_back);
    if (false)
        console.log(JSON.stringify(words_to_play.map(w => language_current_definitions[w])))
    let current = words_to_play.pop();
    if (!current) {
        screen_back();
        return;
    }
    let front;
    if (use_mistakes) {
        front = (parent, w) => w.front(parent);
    } else {
        if (category_selected === category_definition) {
            if (no_transliteration) {
                front = (parent, w) => element_text_bible_word(parent, w);
            } else {
                front = (parent, w) => element_text_bible_word_transliteration(parent, w);
            }
        } else {
            front = (parent, w) => element_text_bible_word(parent, w);
        }
    }
    let back;
    if (use_mistakes) {
        back = (parent, w) => w.back(parent);
    } else {
        if (category_selected === category_definition) {
            if (definition_short_use) {
                back = (parent, w) => text(parent, definition_short(w["definition"]));
            } else {
                back = (parent, w) => text(parent, w["definition"]);
            }
        } else {
            if (no_transliteration) {
                back = (parent, w) => element_text_bible_word(parent, w);
            } else if (category_selected == category_transliteration) {
                back = (parent, w) => element_text_bible_transliteration(parent, w);
            } else {
                back = (parent, w) => element_text_bible_word_transliteration(parent, w);
            }
        }
    }
    
    let front_original = front;
    let back_original = back;
    if (Math.random() > 1/2) {
        [front, back] = [back, front]
    }
    let t = text(document.body,'');
    front(t, use_mistakes ? current : language_current_definitions[current]);
    let choices_wrong = words_playable_shuffled_get(choice, use_mistakes).filter(w => w !== current).slice(0, max_choices - 1);

    for (let word_ of list_shuffle([current].concat(choices_wrong))) {
        let word = word_;
        let b = button(document.body, '', async () => {
            if (word === current) {
                style_color_and_border(b, 'green');
                b.style['background-color']='lightgreen';
                await audio_play_try(
                    language_current_audio_code_get(), 
                    language_current_definitions[use_mistakes ? word.strong : word]["word"]
                    )
                screen_quiz(choice, use_mistakes);
            } else {
                style_color_and_border(b, '#E74C3C');
                b.style['background-color']='#F5B7B1';
                if (!use_mistakes) {
                    for (let w of [word, current]) {
                        let mistake_id = `${category_selected}::${w}`;
                        let mistake = {
                            front: (parent) => front_original(parent, language_current_definitions[w]),
                            back: (parent) => back_original(parent, language_current_definitions[w]),
                            strong: w,
                            id: mistake_id
                        };
                        if (mistakes.filter(m => m.id === mistake.id).length === 0) {
                            mistakes.push(mistake);
                        }
                    }
                }
            }
        });
        back(b, use_mistakes ? word : language_current_definitions[word]);
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
                screen_category(choice);
            } else {
                depth_current++;
                learn_choice_stack.push(choice);
                screen_learn(choice);
            }
        });
    }
    let last = list_last(learn_choice_stack);
    button(document.body, `Learn all words ${last.low} to ${last.high}`, () => {
        screen_category(last);
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