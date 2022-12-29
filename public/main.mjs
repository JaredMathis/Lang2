function button(parent, text, on_click) {
    let b = element(parent, "BUTTON", text);
    b.style["border-radius"] = "2vh";
    b.style["border"] = "0.5vh solid";
    b.addEventListener("click", on_click);
    return b;
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
let language_current_definitions;

async function screen_language() {
    element_clear(document.body);
    button(document.body, "Home", ev => screen_main());
    button(document.body, "Learn", ev => screen_learn());
    button(document.body, "Mistakes", ev => screen_mistakes());
    button(document.body, "Read", ev => screen_read());
    learn_choice_stack = [{low: 1, high: language_current_words.length}]
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
let learn_choice_stack = [];
let words_to_play;

function words_playable_shuffled_get(choice) {
    let result = words_playable_get(choice);
    list_shuffle(result);
    return result;
}

function words_playable_get(choice) {
    return language_current_words.slice(choice.low - 1, choice.high);
}

function words_to_play_generate(choice) {
    words_to_play = words_playable_shuffled_get(choice);
}

let max_choices = 4;

function screen_study(choice) {
    let screen_back = () => screen_pre_practice(choice);
    screen_home_non(screen_back);
    text_words_low_high(choice);
    let words = words_playable_get(choice)
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

function screen_pre_practice(choice) {
    let screen_back = screen_learn;
    screen_home_non(screen_back);

    text_words_low_high(choice);
    button(document.body, 'Study', () => screen_study(choice));
    button(document.body, 'Practice', () => {
        words_to_play_generate(choice);
        screen_practice(choice);
    });
}

function text_words_low_high(choice) {
    text(document.body, `Words ${choice.low} to ${choice.high}`);
}

function screen_practice(choice) {
    let screen_back = () => screen_pre_practice(choice);
    screen_home_non(screen_back);
    let current = words_to_play.pop();
    if (!current) {
        screen_back();
    }
    let front = "word";
    let back = "definition";
    if (Math.random() > 1/2) {
        [front, back] = [back, front]
    }
    text(document.body, language_current_definitions[current][front]);
    let choices_wrong = words_playable_shuffled_get(choice).filter(w => w !== current).slice(0, max_choices - 1);

    for (let word of list_shuffle([current].concat(choices_wrong))) {
        let b = button(document.body, language_current_definitions[word][back], async () => {
            if (word === current) {
                b.style.color = 'green'
                await audio_play(language_current["gcloud_code"], language_current_definitions[word]["word"])
                screen_practice(choice);
            } else {
                b.style.color = 'red'
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
            screen_language();
        })
    }
}

screen_main()