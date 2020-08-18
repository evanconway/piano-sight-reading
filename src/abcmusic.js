import abcjs from "abcjs";
import { generateNotes, getPitchStringFromIndex } from "./chord";

const MIDI_TIMING_ARRAY = []; // setup in generateMidiTimingArr()
const COLOR_SELECT = "#00AA00";
const COLOR_DEF = "#000000";
const BASE_DURATION = 48; // this is actually the denominator of the default timing
const DURATIONS = new Map();
DURATIONS.set("Whole", BASE_DURATION);
DURATIONS.set("Half", BASE_DURATION / 2);
DURATIONS.set("Quarter", BASE_DURATION / 4);
DURATIONS.set("Eighth", BASE_DURATION / 8);

// populate duration drop downs with these values:
let durations = "";
DURATIONS.forEach((duration, name) => {
    durations += `<option value="${duration}">${name}</option>`;
})
document.querySelector(".duration_top").innerHTML = durations;
document.querySelector(".duration_bot").innerHTML = durations;

// music consts
const TITLE = "";
const METER = "4/4";
let KEY = "C";
let NOTES_TOP = [];
let NOTES_BOT = [];
const MEASURES_PER_LINE = 4;
let DURATION_TOP = 12;
let DURATION_BOT = 24;
const NUMBER_MAX = 4;
const NUMBER_MIN = 0;
let NUMBER_TOP = 3;
let NUMBER_BOT = 1;
let INDEX_TOP_MAX = 11; // all max/min indices are inclusive
let INDEX_TOP_MIN = 0;
let INDEX_BOT_MAX = 0;
let INDEX_BOT_MIN = -11;
const INDEX_TOP_MAX_CAP = 20;
const INDEX_TOP_MIN_CAP = -5;
const INDEX_BOT_MAX_CAP = 5;
const INDEX_BOT_MIN_CAP = -20;
let USE_HARMONY = false;
const HARMONY_BUTTON = document.querySelector(".harmony");

let playCursor = 0;

// sets play cursor to given index
const cursorSet = function(timeIndex) {
    // the index here is for the timing array
    playCursor = timeIndex;
    NOTES_TOP.forEach(e => {
        if (e.timingIndex === playCursor) e.path.setAttribute("fill", COLOR_SELECT);
        else e.path.setAttribute("fill", COLOR_DEF);
    });
    NOTES_BOT.forEach(e => {
        if (e.timingIndex === playCursor) e.path.setAttribute("fill", COLOR_SELECT);
        else e.path.setAttribute("fill", COLOR_DEF);
    });
}

// returns true if given array of midi is equal to midi in timing array at play cursor
const playedCorrect = function(midiArr = []) {
    if (MIDI_TIMING_ARRAY[playCursor] === null) return false;
    if (midiArr.length !== MIDI_TIMING_ARRAY[playCursor].length) return false;
    
    // note that the order of the elements does not have to be the same
    let result = true;
    midiArr.forEach(e => {
        if (!MIDI_TIMING_ARRAY[playCursor].includes(e)) result = false;
    })
    return result;
}

// move cursor forward to next valid set of notes
// returns true if cursor was advanced, false if it couldn't (at end)
const cursorAdv = function() {
    let result = true;
    playCursor++;
    while (MIDI_TIMING_ARRAY[playCursor] === null && playCursor < MIDI_TIMING_ARRAY.length) playCursor++;
    if (playCursor === MIDI_TIMING_ARRAY.length) {
        playCursor = 0;
        result = false;
    }
    cursorSet(playCursor);
    return result;
}

// move cursor backward to previous valid set of notes
const cursorBck = function () {
    playCursor--;
    while (MIDI_TIMING_ARRAY[playCursor] === null && playCursor >= 0) playCursor--;
    if (playCursor < 0) playCursor = 0;
    cursorSet(playCursor);
}

const generateABC = function () {

    let result = `T:${TITLE}\n`;
    result += `M:${METER}\n`;
    result += `L:1/${BASE_DURATION}\n`;
    result += `K:${KEY}\n`;
    /* The staff marker is syntax that declares 2 staves that we can write
    notation to. After experimenting, it looks like writing `V:` lets us
    declare which staff we're writing to. The default cleff of a staff is
    treble, and we can change this with clef=bass inside of []. But it
    also appears we have to set the key again as well. So the full line
    should be [K:A clef=bass]. Since we have to do this for each new line,
    I think it makes the most sense to just redeclare both staves after 
    each line break. */
    result += "%%staves {1 2}\n";
    const headerTop = `V:1\n[K:${KEY} clef=treble]\n`;
    const headerBot = `V:2\n[K:${KEY} clef=bass]\n`;
    /* Now comes line generation. Our data is stored as an array of chord objects.
    These objects already store convenient data like length of notes, and string 
    generation functions. 
    
    We're going to iterate over these two arrays, creating lines and measures
    from them. Lines are determined by number of measures. Measures are determined
    by chord length and meter. Using two separate indices, one for each array,
    we'll create lines unil all notes in both arrays have been iterated through. */
    let iTop = 0;
    let iBot = 0;
    while (iTop < NOTES_TOP.length && iBot < NOTES_BOT.length) {
        // generate top line
        let lineTop = "";
        /* This outer loop is for generating the correct number of measures. Observe
        that we stop if the index reaches the end of the notes array*/
        for (let m = 0; m < MEASURES_PER_LINE && iTop < NOTES_TOP.length; m++) {
            /* This inner loop is for generating a measure. Like line generation, we will 
            stop if the index reaches the end of the array. Here, we also keep track of 
            note time so we can break beams correctly if the note value is small enough */

            for (let time_m = 0, time_b = 0; time_m < BASE_DURATION && iTop < NOTES_TOP.length; iTop++) {
                lineTop += NOTES_TOP[iTop].getABCString(KEY);
                time_m += NOTES_TOP[iTop].duration;
                time_b += NOTES_TOP[iTop].duration;
                if (time_b >= BASE_DURATION / 4) { // shouldn't be 4, should be variable
                    time_b = 0;
                    lineTop += " ";
                }
            }
            lineTop += "|";
        }
        // generate bottom line, same logic as top
        let lineBot = "";
        for (let m = 0; m < MEASURES_PER_LINE && iBot < NOTES_BOT.length; m++) {
            for (let time_m = 0, time_b = 0; time_m < BASE_DURATION && iBot < NOTES_BOT.length; iBot++) {
                lineBot += NOTES_BOT[iBot].getABCString(KEY);
                time_m += NOTES_BOT[iBot].duration;
                time_b += NOTES_BOT[iBot].duration;
                if (time_b >= BASE_DURATION / 4) { // shouldn't be 4, should be variable
                    time_b = 0;
                    lineBot += " ";
                }
            }
            lineBot += "|";
        }
        // add final bar if line is final line (indices are at end)
        if (iTop === NOTES_TOP.length) lineTop += "]";
        if (iBot === NOTES_BOT.length) lineBot += "]";
        // add lines
        result += headerTop;
        result += lineTop + "\n";
        result += headerBot;
        result += lineBot + "\n";
    }
    return result;
}

// assigns elements from array of path tags to the staffTop and staffBot chords
const assignPaths = function(notesTop = [], notesBot = []) {
    /* Note, this function assumes that the given path arrays are created from the 
    ABC notation generated by generateABC. If they are not, the mapping will be 
    totally wrong. See the index file for usage. */
    NOTES_TOP.forEach((e, i) => e.path = notesTop[i]);
    NOTES_BOT.forEach((e, i) => e.path = notesBot[i]);
}

// returns array of array of midi values
const generateMidiTimingArr = function() {

    // just in case, we clear the timing array first, apparently this is a good way to do that
    MIDI_TIMING_ARRAY.length = 0;

    /* The array that this function returns represents the notes from staffTop
    and staffBot as midi values and their timing. The midi values are straight
    forward. Each element in the array is itself an array of midi integers 
    representing pitch. The position of these values in the array represents
    when that note starts in time. Each array slot represents a music time value
    of 1/DEFAULT_DURATION. For now, we are not tracking the end of notes. */
    let index = 0;
    // top staff first
    NOTES_TOP.forEach(e => {
        for (let i = 0; i < e.duration; i++) MIDI_TIMING_ARRAY.push(null); // add correct "duration"
        e.timingIndex = index;
        MIDI_TIMING_ARRAY[index] = [];
        e.pitches.forEach(pitch => {
            if (!MIDI_TIMING_ARRAY[index].includes(pitch.midi)) MIDI_TIMING_ARRAY[index].push(pitch.midi);
        });
        index = MIDI_TIMING_ARRAY.length;
    });
    /* Now the bottom staff. Note that this loop will not add values to the MIDI_TIMING_ARRAY.
    It will only add pitches to existing slots. We are assuming that staffTop and 
    staffBot are the exact same musical length. If they are not, this function will
    break. We'll just have to be careful and ensure our music generation functions
    make both staves the same musical length. */
    index = 0;
    NOTES_BOT.forEach(e => {
        e.timingIndex = index;
        if (MIDI_TIMING_ARRAY[index] === null) MIDI_TIMING_ARRAY[index] = [];
        e.pitches.forEach(pitch => {
            if (!MIDI_TIMING_ARRAY[index].includes(pitch.midi)) MIDI_TIMING_ARRAY[index].push(pitch.midi);
        });
        index += e.duration;
    })
    console.log(MIDI_TIMING_ARRAY);
    return MIDI_TIMING_ARRAY
}

const makeMusic = function (resetHarmony = true) {

    // ensure the key signature drop down shows the correct value
    document.querySelector(".keys").value = KEY;

    // ensure duration drop downs show correct value
    document.querySelector(".duration_top").value = DURATION_TOP;
    document.querySelector(".duration_bot").value = DURATION_BOT;

    /* Populate the note range drop downs with allowable values. Note that our design does not permit
    for a min index to be greater than a max index, or vice versa. Also note that we populate from 
    greatest value to least for visual clarity. */
    let options = "";
    for (let i = INDEX_TOP_MAX; i >= INDEX_TOP_MIN_CAP; i--) options += `<option value="${i}">${getPitchStringFromIndex(i)}</option>`;
    document.querySelector(".note_top_min").innerHTML = options;
    document.querySelector(".note_top_min").value = INDEX_TOP_MIN;
    options = "";
    for (let i = INDEX_TOP_MAX_CAP; i >= INDEX_TOP_MIN; i--) options += `<option value="${i}">${getPitchStringFromIndex(i)}</option>`;
    document.querySelector(".note_top_max").innerHTML = options;
    document.querySelector(".note_top_max").value = INDEX_TOP_MAX;
    options = "";
    for (let i = INDEX_BOT_MAX; i >= INDEX_BOT_MIN_CAP; i--) options += `<option value="${i}">${getPitchStringFromIndex(i)}</option>`;
    document.querySelector(".note_bot_min").innerHTML = options;
    document.querySelector(".note_bot_min").value = INDEX_BOT_MIN;
    options = "";
    for (let i = INDEX_BOT_MAX_CAP; i >= INDEX_BOT_MIN; i--) options += `<option value="${i}">${getPitchStringFromIndex(i)}</option>`;
    document.querySelector(".note_bot_max").innerHTML = options;
    document.querySelector(".note_bot_max").value = INDEX_BOT_MAX;

    // limit number of notes based on min and max staff indices
    if (INDEX_TOP_MAX - INDEX_TOP_MIN < NUMBER_TOP - 1) NUMBER_TOP = INDEX_TOP_MAX - INDEX_TOP_MIN + 1;
    if (INDEX_BOT_MAX - INDEX_BOT_MIN < NUMBER_BOT - 1) NUMBER_BOT = INDEX_BOT_MAX - INDEX_BOT_MIN + 1;

    // populate number of note drop downs with allowable values
    options = "";
    let range = INDEX_TOP_MAX - INDEX_TOP_MIN + 1; // add 1 because if indices are the same, that allows 1 note
    if (range > NUMBER_MAX) range = NUMBER_MAX;
    for (let i = NUMBER_MIN; i <= range; i++) options += `<option value="${i}">${i}</option>`;
    document.querySelector(".number_top").innerHTML = options;
    document.querySelector(".number_top").value = NUMBER_TOP;
    options = "";
    range = INDEX_BOT_MAX - INDEX_BOT_MIN + 1;
    if (range > NUMBER_MAX) range = NUMBER_MAX;
    for (let i = NUMBER_MIN; i <= range; i++) options += `<option value="${i}">${i}</option>`;
    document.querySelector(".number_bot").innerHTML = options;
    document.querySelector(".number_bot").value = NUMBER_BOT;

    // generate notes
    let notes = generateNotes(KEY, USE_HARMONY, resetHarmony, INDEX_TOP_MIN, INDEX_TOP_MAX, NUMBER_TOP, DURATION_TOP, INDEX_BOT_MIN, INDEX_BOT_MAX, NUMBER_BOT, DURATION_BOT);
    NOTES_TOP = notes[0];
    NOTES_BOT = notes[1];

	/* I'm going to link the documentation right here: 
	https://paulrosen.github.io/abcjs/visual/render-abc-options.html
	The renderAbc function accepts an object filled with options for abcjs. 
	It's important to understand why we've chosen the options we have...  
	if we decide to use them */
    abcjs.renderAbc(document.querySelector(".score"), generateABC(), {
        add_classes: true,
        staffwidth: 1100,
    })

    /* This is a hack to remove the build-in red highlighting effect. After the abcjs.renderAbc
    function creates the html, the rect tags are setup to listen for click events. When clicked, 
    they color the path tag (note) beneath them red. Cloned tags do not retain the event listeners.
    So by replacing each tag with a clone of itself, we remove those listeners. */
    Array.from(document.querySelectorAll("rect")).forEach(rect => {
        let clone = rect.cloneNode(true);
        rect.parentNode.replaceChild(clone, rect);
    })

	/* We need to be able to refer to the html to change the color of notes. We do that
	with query selectors. The generateABC function does more than create strings. It also
	creates music objects that represent the music. The assign paths function gives
	these objects references to their own html elements. */
    let pathsTop = Array.from(document.querySelectorAll("div svg path.abcjs-note.abcjs-v0"));
    let pathsBot = Array.from(document.querySelectorAll("div svg path.abcjs-note.abcjs-v1"));
    assignPaths(pathsTop, pathsBot);

    // the timing array is how we keep track of where the user is in the music
    generateMidiTimingArr();

    // set cursor at the beginning
    cursorSet(0);
}

// UI element "wiring"

// key signature drop down
document.querySelector(".keys").addEventListener("change", e => {
    KEY = e.target.value;
    makeMusic()
})

// note duration drop downs
document.querySelector(".duration_top").addEventListener("change", e => {
    DURATION_TOP = parseInt(e.target.value);
    makeMusic();
})
document.querySelector(".duration_bot"). addEventListener("change", e => {
    DURATION_BOT = parseInt(e.target.value);
    makeMusic();
})

// number of note drop downs
document.querySelector(".number_top").addEventListener("change", e => {
    NUMBER_TOP = parseInt(e.target.value);
    makeMusic();
})
document.querySelector(".number_bot").addEventListener("change", e => {
    NUMBER_BOT = parseInt(e.target.value);
    makeMusic();
})

// top staff range drop downs
document.querySelector(".note_top_min").addEventListener("change", e => {
    INDEX_TOP_MIN = parseInt(e.target.value);
    makeMusic();
})
document.querySelector(".note_top_max").addEventListener("change", e => {
    INDEX_TOP_MAX = parseInt(e.target.value);
    makeMusic();
})
document.querySelector(".note_bot_min").addEventListener("change", e => {
    INDEX_BOT_MIN = parseInt(e.target.value);
    makeMusic();
})
document.querySelector(".note_bot_max").addEventListener("change", e => {
    INDEX_BOT_MAX = parseInt(e.target.value);
    makeMusic();
})

// harmony button
const harmonyButtonText = function() {
    if (USE_HARMONY) HARMONY_BUTTON.innerHTML = "Use Harmony: ON";
    else HARMONY_BUTTON.innerHTML = "Use Harmony: OFF";
}
harmonyButtonText();

HARMONY_BUTTON.addEventListener("click", e => {
    USE_HARMONY = !USE_HARMONY;
    harmonyButtonText();
    makeMusic();
})

export { cursorAdv, cursorBck, playedCorrect, makeMusic }
