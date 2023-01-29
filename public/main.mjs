
let languages = await http_get(file_path_get("languages.json"))

let language_current;
let language_current_words;
let language_current_definitions;
let language_current_roots;
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
    style_button(b);
    click(b, on_click);
    return b;
}

function style_button(b) {
    b.style.color = 'black';
    b.style['border-color'] = 'lightgray';
    b.style['background-color'] = 'WhiteSmoke';
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

let hash_home_first = true;

async function screen_home() {
    depth_current = 0;
    learn_choice_stack.length = 0;
    screen_base(ev => screen_choose_chapter());
    text_book_chapter();
    let read = button(document.body, "Read chapter", ev => screen_read_chapter());
    let learn = button(document.body, "Learn words in chapter", ev => screen_learn());
    if (hash_home_first && hash_get()['Home']=== 'Read') {
        hash_home_first= false;
        read.click();
    }
    if (mistakes.length > 0) {
        button(document.body, "Mistakes", ev => screen_mistakes());
    }
    learn_choice_stack = [{low: 1, high: language_current_words.length}]
}

function text_book_chapter() {
    text(document.body, book_index_value.name + " " + selected_chapter);
}

function screen_home_non(back_on_click) {
    screen_base(back_on_click);
    text_book_chapter();
}

function screen_base(back_on_click) {
    element_clear(document.body);
    main_toolbar(document.body, back_on_click);
}

let selected_book = false;

let book_first = true;
async function screen_choose_book() {
    selected_chapter = undefined;
    book_index_key = undefined;
    book_index_value = undefined;
    selected_book = undefined;

    screen_base(screen_main);
    let min_found = false;
    let max_found = false;
    for (let key in bible_index) {
        let book_index = bible_index[key];
        if (!language_current.bible || book_index.name === language_current.bible.min) {
            min_found = true;
        }
        if (min_found && !max_found) {
            let book_abberviation;
            let button_get;
            if (language_current.biblical) {
                let book_name_length_max = 3;
                book_abberviation = book_index.name.replace(' ', '').substr(0, book_name_length_max);
                button_get = button_fifth
            } else {
                book_abberviation = book_index.name;
                button_get = button;
            }
            let b = button_get(
                document.body,
                book_abberviation, 
                () => {
                    book_index_key = key;
                    book_index_value = book_index;
                    selected_book = book_abberviation;
                    screen_choose_chapter();
                });
            style_button_book_choose(b);
            
            if (book_first && hash_get()["Book"] === book_abberviation) {
                book_first = false;
                b.click();
            }
        }
        if ( !language_current.bible || book_index.name === language_current.bible.max) {
            max_found = true;
        }
    }
}

function style_button_book_choose(b) {
    b.style['font-size'] = '4vh';
}

function button_fourth(parent, text, on_click) {
    let b = button(parent, text, on_click);
    b.style.width = '25%';
    return b;
}
function button_fifth(parent, text, on_click) {
    let b = button(parent, text, on_click);
    b.style.width = '20%';
    return b;
}
let chapter_first = true;
async function screen_choose_chapter() {
    selected_chapter = undefined;
    screen_base(screen_choose_book);
    text(document.body, book_index_value.name)
    for (let chapter of book_index_value.chapters) {
        let b = button_fifth(document.body, chapter, async () => {
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
        if (chapter_first && hash_get()["Chapter"] === chapter) {
            chapter_first = false;
            b.click();
        }
    }
}

function style_color_and_border(element, color) {
    element.style['color'] = color;
    element.style['border-color'] = color;
}

function style_bible_word(element, regular_weight, english_letters=false) {
    if (!regular_weight) {
        element.style['font-weight'] = '700';
    }
    style_color_and_border(element, blue);
    if (true) {
        if (!english_letters && language_current_hebrew_is()) {
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

function arrow_left_get() {
    return '←'
}

function document_scroll_to_top() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
}
let hash_chapter_read_first = true;
async function screen_read_chapter(){
    screen_home_non(() =>  screen_home());
    let verse_toolbars = [];
    let translitties = [];
    let inflectties = [];
    let englishes = [];
    let ltrs = [];

    let settings_show = button(document.body, 'Settings', () => {
        settings_toolbar.hidden = !settings_toolbar.hidden;
    });
    let settings_hide = button(document.body, 'Hide settings', () => {
        settings_toolbar.hidden = !settings_toolbar.hidden;
    });
    element_two_click_toggle(settings_show, settings_hide);

    let settings_toolbar = span(document.body);
    settings_toolbar.hidden = true;
    let english_hide = button(settings_toolbar, 'Hide English', () => {
        englishes.forEach(e => e.hidden = true);
    });
    let english_show = button(settings_toolbar, 'Show English', () => {
        englishes.forEach(e => e.hidden = false);
    });
    element_two_click_toggle(english_hide, english_show);
    let toggle_transliteration_toggled = false;
    let toggle_transliteration = button(settings_toolbar, 'Toggle transliteration', () => {
        translitties.forEach(e => e.hidden = !e.hidden);
        toggle_transliteration_toggled = !toggle_transliteration_toggled;
        if (toggle_transliteration_toggled) {
            ltrs.forEach(e => e.dir = "ltr");
            translitties.forEach(e => style_bible_word(e, false, true));
        } else {
            ltrs.forEach(e => e.dir = language_current_direction_ltr_get());
            translitties.forEach(e => style_bible_word(e, false, false));
        }
    });

    let toggle_root_inflection_toggled = false;
    let toggle_root_inflection = button(settings_toolbar, 'Toggle root/inflection', () => {
        toggle_root_inflection_toggled = !toggle_root_inflection_toggled;
        inflectties.forEach(e => e.hidden = !e.hidden);
    });

    let go_to_verse_show = button(document.body, 'Go to verse', () => {
        choose_verse_container.hidden = !choose_verse_container.hidden;
    });
    let go_to_verse_hide = button(document.body, 'Hide go to verse', () => {
        choose_verse_container.hidden = !choose_verse_container.hidden;
    });
    element_two_click_toggle(go_to_verse_show, go_to_verse_hide);
    let choose_verse_container = element(document.body, 'div');
    choose_verse_container.hidden = true;

    let choose_verse_after_render;
    let verse_element_previous_;
    let set_next;
    let chapter_english = await bible_chapter_get("berean", book_index_key, selected_chapter);
    for (let verse of chapter_json) {
        let verse_element_previous = verse_element_previous_;
        let english_version = chapter_english.filter(v => v.verse === verse.verse)[0];
        let verse_element = text(document.body, '');

        if (false) {
            console.log({v:verse.verse,v2:hash_get()['Verse']})
        }
        if (hash_chapter_read_first && hash_get()['Verse'] === verse.verse) {
            hash_chapter_read_first= false;
            choose_verse_after_render = verse_element;
        }

        let verse_toolbar = span(verse_element);
        verse_toolbar.hidden = true;
        verse_toolbars.push(verse_toolbar);
        button_fifth(verse_toolbar, '↑', () => {
            document_scroll_to_top();
        });
        let verse_element_previous_button = button_fifth(verse_toolbar, arrow_left_get(), () => {
            verse_element_previous.scrollIntoView();
        });
        if (!verse_element_previous) {
            verse_element_previous_button.disabled = true;
        }
        let next = button_fifth(verse_toolbar, '→');
        next.disabled = true;
        if (set_next) {
            set_next(verse_element);
        }
        set_next = (verse_element_next) => {
            click(next, () => verse_element_next.scrollIntoView());
            next.disabled = false;
        }

        let verse_element_original = text(verse_element, '');
        verse_element_original.dir = language_current_direction_ltr_get();
        ltrs.push(verse_element_original);
        
        let verse_number = span(verse_element_original, verse.verse);
        click(verse_number, () => {
            verse_toolbars.forEach(v => v.hidden = !v.hidden);
            verse_element.scrollIntoView();
        })
        button_fifth(choose_verse_container, verse.verse, () => {
            verse_element.scrollIntoView();            
        });
        verse_number.style['font-weight'] = '600';
        for (let token of verse.tokens) {
            let spacer = span(verse_element_original, ' ');
            style_bible_word(spacer);

            let token_token;
            let token_root;
            let token_transliteration;
            let token_root_transliteration;
            let root_definition;
            if (typeof token === typeof '') {
                token_token = token;
                token_root = language_current_roots[token] ? language_current_roots[token].join(' ') : token;
                token_transliteration = '';
                token_root_transliteration = '';
                root_definition = 'TODO';
            } else {
                token_token = token;
                root_definition = language_current_definitions[token.strong];
                token_root = root_definition["word"];
                token_transliteration = token.transliteration;
                token_root_transliteration = ["transliteration"]
            }

            let translated = span(verse_element_original);
            let translated_a = span(translated);
            translitties.push(translated_a);
            let translated_c = span(translated_a, token_token);
            inflectties.push(translated_c);
            let translated_d = span(translated_a, token_root);
            translated_d.hidden = true;
            inflectties.push(translated_d);
            let translated_b = span(translated);
            translated_b.hidden = true;
            translitties.push(translated_b);
            let translated_e = span(translated_b, token_transliteration);
            inflectties.push(translated_e);
            let translated_f = span(translated_b, token_root_transliteration);
            translated_f.hidden = true;
            inflectties.push(translated_f);
            [translated_c,translated_e,translated_d,translated_f].forEach(t => style_bible_word(t));
            click(translated, async function translation_display_toggle() {
                translation.hidden = !translation.hidden
                if (!translation.hidden) {
                    await audio_play_try_lower_and_upper(
                        language_current_audio_code_get(), 
                        toggle_root_inflection_toggled 
                            ? token_root
                            : token_token)
                }
            });

            let translation = span(verse_element_original, '');
            translation.dir = 'ltr';
            translation.style['font-weight'] = '100';
            translation.hidden = true;
            let translation1 = span(translation, token.translation + " ")
            translation1.style['font-style'] = 'italic';
            translation1.style['font-size'] = "4.5vh";
            translation.style['font-weight'] = '400';
            if (root_definition) {
                let translation2 = span(translation, '');
                let translation2_a = span(translation2);
                let translation2_c = span(translation2_a, token_root);
                inflectties.push(translation2_c);
                let translation2_d = span(translation2_a, token_token);
                inflectties.push(translation2_d);
                translation2_d.hidden = true;
                let translation2_b = span(translation2);
                translation2_b.hidden = true;
                let translation2_e = span(translation2_b, token_root_transliteration);
                inflectties.push(translation2_e);
                let translation2_f = span(translation2_b, token_transliteration);
                translation2_f.hidden = true;
                inflectties.push(translation2_f);
                click(translation2, async () => {
                    await audio_play_try_lower_and_upper(
                        language_current_audio_code_get(), 
                        toggle_root_inflection_toggled 
                            ? token_token
                            : token_root)
                })
                translation2.style['font-size'] = "4.5vh";
                translation2.style.opacity = '0.6';
                [translation2_c,translation2_d].forEach(t => style_bible_word(t, true));
                translitties.push(translation2_a);
                translitties.push(translation2_b);
                let translation3 = span(
                    translation, 
                    " " + definition_short(root_definition))
                translation3.style['font-size'] = "4.5vh";
                translation3.style.opacity = '0.6';
                let translation4 = span(
                    translation, 
                    " " + (root_definition))
                translation4.style['font-size'] = "4.5vh";
                translation4.style.opacity = '0.6';
                element_two_click_toggle(translation3, translation4);
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

        verse_element_previous_ = verse_element;
    }

    if (choose_verse_after_render) {
        choose_verse_after_render.scrollIntoView();
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
    // console.log({bible_version,padded,chapter})
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
    let roots = language_current_words.slice(choice.low - 1, choice.high);

    if (inflected_use) {
        let inflections = [];
        for (let verse of chapter_json) {
            for (let t of verse.tokens) {
                let {strong} = t;
                if (roots.includes(strong)) {
                    let {token} = t;
                    const root = language_current_definitions[strong]["word"];
                    if (root === token) {
                        continue;
                    }
                    if (inflections.filter(i => i.token.toLowerCase() === token.toLowerCase()).length === 0) {
                        inflections.push({
                            strong,
                            token,
                            root,
                        })
                    }
                }
            }
        }
        return inflections;
    }

    return roots;
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
    let words_playable = words_playable_get(choice, use_mistakes)
    for (let word_playable of words_playable) {
        let root_word = language_current_definitions[
            (use_mistakes || inflected_use) 
                ? word_playable.strong 
                : word_playable
            ];
        if (!root_word) {
            console.log('missing word');
            continue;
        }
        let word_audio = inflected_use ? word_playable["token"] : root_word["word"];
        if (word_playable.audio) {
            word_audio = word_playable.audio;
        }
        let b = button(document.body, '', async () => {
            await audio_play_try_lower_and_upper(language_current_audio_code_get(), word_audio)
        });
        if (use_mistakes) {
            word_playable.front(b);
            span(b, " : ");
            word_playable.back(b);
        } else {
            if (no_transliteration) {
                (inflected_use ? style_bible_word_alternate : element_text_bible_word)(b, root_word);
            } else {
                element_text_bible_word_transliteration(b, root_word);
            }

            if (definition_use) {
                span(b, " : " + (definition_short_use ? definition_short : identity)(root_word["definition"]));
            } else if (inflected_use) {
                span(b, " : " );
                style_bible_word(span(b, (word_playable["token"])));
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

function string_upper_contains(s) {
    return s.toLowerCase() !== s;
}
function string_lower_contains(s) {
    return s.toUpperCase() !== s;
}

async function audio_play_try_lower_and_upper(audio_language_code, translated) {
    let completed = false;
    return new Promise(async (resolve, reject) => {
        let inner = new Promise(async (resolve, reject) => {
            if (await audio_play_try(audio_language_code, translated)) {
                resolve();
            } else {
                let other;
                let first = translated[0];
                let remaining = translated.slice(1);
                if (string_lower_contains(first)) {
                    other = first.toUpperCase() + remaining;
                } else if (string_upper_contains(first)) {
                    other = first.toLowerCase() + remaining;
                } else {
                    debugger;
                    reject('This should not happen');
                    return;
                }
                if (await audio_play_try(audio_language_code, other)) {
                    resolve();
                    return;
                } 
                reject('Could not find audio file');
            }
        });
        inner.then(
            () => { completed = true; resolve(); }, 
            () => { completed = true; reject();  }
            );
        
        setTimeout(() => {
            if (!completed) {
                reject('Took too long to play audio');
            }
        }, 5000);
    });
}

async function audio_play_try(audio_language_code, translated) {
    try {
        let a = audio(audio_language_code, translated);
        await new Promise(async (resolve, reject) => {
            try {
                a.addEventListener('ended', async () => {
                    resolve();
                });
                await a.play();
            } catch (e) {
                reject();
            }
        });
        return true;
    } catch (e) {
        return false;
    }
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
let category_inflected = 'Inflected';
let category_spelling = 'Spelling';

let definition_use;
let no_transliteration;
let definition_short_use;
let inflected_use;

function screen_category(choice) {
    screen_home_non(screen_learn);
    text_words_low_high(choice);
    function category_set(c) {
        category_selected = c
    }
    let categories = [
        {
            label: "Word vs. Transliteration", 
            action: c => { 
                category_set(category_transliteration); 
            }
        },
        { 
            label: "Word(+Transliteration) vs. Long definition", 
            action: c => { 
                definition_use = true;
                category_set(category_definition); 
            }
        },
        { 
            label: "Word(+Transliteration) vs. Short definition",
            action: c => { 
                definition_use = true;
                definition_short_use = true;
                category_set(category_definition); 
            }
        },
        {
            label: "Word vs. Short definition", 
            action: c => { 
                definition_use = true;
                definition_short_use = true;
                no_transliteration = true;
                category_set(category_definition); 
            }
        },
        {
            label: `Inflected vs. ${icon_root_get()}Root`, 
            action: c => { 
                no_transliteration = true;
                inflected_use = true;
                category_set(category_inflected); 
            }
        },
        {
            label: "Inflected vs. Short definition", 
            action: c => { 
                no_transliteration = true;
                definition_short_use = true;
                definition_use = true;
                inflected_use = true;
                category_set(category_inflected); 
            }
        },
        {
            label: "Short definition vs. Root spelling", 
            action: c => { 
                // no_transliteration = true;
                definition_short_use = true;
                definition_use = true;
                // inflected_use = true;
                category_set(category_spelling); 
            }
        },
    ]
    let others = [
        { 
            label: "Word vs. Long definition", 
            action: c => { 
                no_transliteration = true;
                category_set(category_definition); 
            }
        },
    ]
    for (let category of categories) {
        button(document.body, category.label, () => {
            no_transliteration = false;
            definition_short_use = false;
            definition_use = false;
            category_selected = false;
            inflected_use = false;
            category.action(category.label);
            screen_pre_quiz(choice);
        });
    }
}

function screen_pre_quiz_generic(choice, screen_back, use_mistakes, noun) {
    screen_home_non(screen_back);

    text_words_low_high(choice, noun);
    button(document.body, 'Study', () => screen_study(choice, use_mistakes));
    if (!use_mistakes && category_selected === category_spelling) {
        let sizes = [4,3,2,1];
        for (let size_ of sizes) {
            let size = size_;
            button(document.body, `Quiz (${size} letter${size != 1 ? 's' : ''})`, () => {
                words_to_play_generate(choice, use_mistakes);
                screen_quiz_spelling(choice, size);
            });
        }
    } else {
        button(document.body, 'Quiz', () => {
            words_to_play_generate(choice, use_mistakes);
            screen_quiz(choice, use_mistakes);
        });
    }
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


function screen_quiz_spelling(choice, size) {
    let screen_back = () => screen_pre_quiz(choice);
    let screen_next = () => screen_quiz_spelling(choice, size);

    screen_home_non(screen_back);
    text(document.body, 'Remaining: ' + words_to_play.length);
    let current = words_to_play.pop();
    if (!current) {
        screen_back();
        return;
    }

    const all_words = words_playable_shuffled_get(choice, false);
    question(screen_next);

    function question(screen_next) {
        let other_words = all_words.filter(w => w !== current);

        let w;
        w = language_current_definitions[current];
        span(document.body, definition_short(w["definition"]));

        let answer_string = w["word"];
        let answer_list = word_partition(answer_string, size);
        let answer_choices = answer_list.slice();

        let answer_preview = button(document.body, '', () => {});
        style_bible_word(answer_preview);

        let current_choice_index = 0;

        let other_word_string = language_current_definitions[list_shuffle(other_words)[0]]["word"].toLowerCase();
        let other_word_list = word_partition(other_word_string, size);
        other_word_list.forEach(segment => answer_choices.push(segment));

        let buttons = [];
        list_shuffle(answer_choices);
        for (let c_ of answer_choices) {
            let c = c_;
            let b = button_fourth(document.body, c, async () => {
                let expected = answer_list[current_choice_index];
                if (c === expected) {
                    current_choice_index++;
                    answer_preview.innerHTML = answer_string.slice(0, current_choice_index * size);
                    b.hidden = true;
                    buttons.forEach(b => {
                        style_button(b);
                        style_bible_word(b);
                    });
                    if (current_choice_index >= answer_list.length) {
                        style_button_correct(answer_preview);
                        try {
                            await audio_play_try_lower_and_upper(
                                language_current_audio_code_get(), 
                                w["word"]
                                )
                        } finally {
                            screen_next();
                        }
                    }
                } else {
                    style_button_wrong(b);
                    let mistake_id = `${category_spelling}::${size}::${answer_string}`;
                    if (mistakes.filter(m => m.mistake_id === mistake_id).length === 0) {
                        mistakes.push({
                            mistake_id,
                            question,
                        })
                    }
                }
            });
            style_bible_word(b);
            buttons.push(b);
        }
    }
}

function word_partition(answer_string, size) {
    let remaining = answer_string;
    let answer_list = [];
    while (remaining.length) {
        answer_list.push(remaining.slice(0, size).toLowerCase());
        remaining = remaining.slice(size);
    }
    return answer_list;
}

function screen_quiz(choice, use_mistakes) {
    let screen_back = 
        () => use_mistakes 
            ? screen_mistakes() 
            : screen_pre_quiz(choice);
    let screen_next = () => screen_quiz(choice, use_mistakes);

    screen_home_non(screen_back);
    text(document.body, 'Remaining: ' + words_to_play.length);
    if (false)
        console.log(JSON.stringify(words_to_play.map(w => language_current_definitions[w])))
    let current = words_to_play.pop();
    if (!current) {
        screen_back();
        return;
    }

    if (current.question) {
        current.question(screen_next);
        return;
    }

    let front;
    if (use_mistakes) {
        front = (parent, w) => w.front(parent);
    } else {
        if (definition_use && !no_transliteration) {
            front = (parent, w) => element_text_bible_word_transliteration(parent, w);
        } else if (inflected_use) {
            front = (parent, w) => style_bible_word(span(parent, w["token"]));
        } else {
            front = (parent, w) => element_text_bible_word(parent, w);
        }
    }
    let back;
    if (use_mistakes) {
        back = (parent, w) => w.back(parent);
    } else {
        if (definition_use) {
            if (definition_short_use) {
                if (inflected_use) {
                    back = (parent, w) => text(parent, definition_short(language_current_definitions[w["strong"]]["definition"]));
                } else {
                    back = (parent, w) => text(parent, definition_short(w["definition"]));
                }
            } else {
                if (inflected_use) {
                    back = (parent, w) => text(parent, (language_current_definitions[w["strong"]]["definition"]));
                } else {
                    back = (parent, w) => text(parent, (w["definition"]));
                }
            }
        } else {
            if (inflected_use) {
                back = (parent, w) => { 
                    let r = style_bible_word_alternate(parent, w);
                    return r;
                };
            } else if (no_transliteration) {
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
    front(t, screen_quiz_w_get(use_mistakes, current));
    const all_choices = words_playable_shuffled_get(choice, use_mistakes);
    let right;
    if (typeof current === typeof '') {
        right = current;
    } else {
        right = current['strong'];
    }
    let filtered_choices = all_choices.filter(w => { 
        let left;
        if (typeof w === typeof '') {
            left = w;
        } else {
            left = w['strong'];
        }
        return left !== right;
    });
    let choices_wrong = filtered_choices.slice(0, max_choices - 1);

    for (let word_ of list_shuffle([current].concat(choices_wrong))) {
        let word = word_;
        let b = button(document.body, '', async () => {
            if (word === current) {
                style_button_correct(b);
                let word_audio;
                if (!use_mistakes && inflected_use) {
                    word_audio = word["token"];
                } else {
                    if (word.audio) {
                        word_audio = word.audio;
                    } else {
                        word_audio = language_current_definitions[use_mistakes ? word.strong : word]["word"];
                    }
                }
                try {
                    await audio_play_try_lower_and_upper(
                        language_current_audio_code_get(), 
                        word_audio
                        )
                } finally {
                    screen_next();
                }
            } else {
                style_button_wrong(b);
                if (!use_mistakes) {
                    for (let w of [word, current]) {
                        let mistake_id = `${category_selected}::${w}`;
                        let w_arg = language_current_definitions[w];
                        let strong = w;
                        if (inflected_use) {
                            mistake_id = `${category_selected}::${w["token"]}`
                            w_arg = w;
                            strong = w["strong"];
                        }
                        let mistake = {
                            front: (parent) => front_original(parent, w_arg),
                            back: (parent) => back_original(parent, w_arg),
                            strong,
                            id: mistake_id
                        };
                        if (inflected_use) {
                            mistake.audio = w["token"];
                        }
                        if (mistakes.filter(m => m.id === mistake.id).length === 0) {
                            mistakes.push(mistake);
                        }
                    }
                }
            }
        });
        back(b, screen_quiz_w_get(use_mistakes, word));
    }
}

function style_button_correct(b) {
    style_color_and_border(b, 'green');
    b.style['background-color'] = 'lightgreen';
}

function style_button_wrong(b) {
    style_color_and_border(b, '#E74C3C');
    b.style['background-color'] = '#F5B7B1';
}

function style_bible_word_alternate(parent, w) {
    let result = span(parent, icon_root_get() + (w["root"] || w["word"]));
    style_bible_word(result);
    return result;
}

function icon_root_get() {
    return "🪵";
}

function screen_quiz_w_get(use_mistakes, word) {
    return (use_mistakes || inflected_use) ? word : language_current_definitions[word];
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


function word_group_sizes_get() {
    let result = word_group_sizes.slice();
    while (result[0] >= language_current_words.length) {
        result.splice(0, 1);
    }
    return result;
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
            if (learn_choice_stack.length >= word_group_sizes_get().length) {
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
    let word_group_size = word_group_sizes_get()[depth_current];
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

function hash_get() {
    let result = {};
    if (window.location.hash) {
        window.location.hash.replace('#', '').split('+').filter(a => a).forEach(kvp => {
            let split = kvp.split('=');
            let key = split[0];
            let value = split[1];
            result[key] = value;
        })
        return result;
    }

    return result;
}

function main_toolbar(parent, button_back_on_click) {
    let toolbar = element(parent, 'div');
    if (language_current) {
        button_fifth(toolbar, flag_html_get(language_current), screen_main);
    }
    if (selected_book) {
        let sb = button_fifth(toolbar, selected_book, screen_choose_book);
        if (selected_book.length > 3) {
            sb.style.fontSize = '2.5vh';
        }
    }
    if (selected_chapter) {
        button_fifth(toolbar, selected_chapter, screen_choose_chapter);
        button_fifth(toolbar, `🏠`, screen_home);
    }
    button_fifth(toolbar, arrow_left_get(), button_back_on_click);
}

function flag_html_get(language) {
    return `<span class="fi fi-${language["flag"]}"></span>`;
}

let language_first = true;

function screen_main() {
    selected_chapter = undefined;
    book_index_key = undefined;
    book_index_value = undefined;
    selected_book = undefined;
    language_current = false;

    element_clear(document.body);
    for (let l of languages) {
        let label = l["name"];
        let b = button(document.body, `${flag_html_get(l)} ${label}` , async ev => {
            language_current = l;
            language_current_definitions = await http_get(
                file_path_get("translations%2F" + language_current["code"] + `_${target_language_code}.json`));
            if (!language_current.biblical) {
                language_current_roots = await http_get(
                    file_path_get("roots%2F" + language_current["code"] + `.json`));
            }
            if (language_current.biblical) {
                bible_index = await http_get(file_path_bible_index_get('bsb'))
            } else {
                bible_index = await http_get(file_path_bible_index_get('vatican%2Fsp'))
            }
            screen_choose_book();
        });
        if (language_first && hash_get()["Language"] === label) {
            language_first = false;
            b.click();
        }
    }
}

screen_main()