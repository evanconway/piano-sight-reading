import abcjs from "abcjs";
import {Chord, generateNotes} from "./chord";

const MIDI_TIMING_ARRAY = []; // setup in generateMidiTimingArr()
const COLOR_SELECT = "#00AA00";
const COLOR_DEF = "#000000";
const BASE_DURATION = 48; // this is actually the denominator of the default timing

// music consts
const TITLE = "Sight Reading";
const METER = "C";
let KEY = "C";
let NOTES_TOP = [];
let NOTES_BOT = [];
const MEASURES_PER_LINE = 4;
let DURATION_TOP = 12;
let DURATION_BOT = 24;
let NUMBER_TOP = 2;
let NUMBER_BOT = 1;

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
    console.log(result);
    return result;
}

// assigns elements from array of path tags to the staffTop and staffBot chords
const assignPaths = function(notesTop = [], notesBot = []) {
    /* Note that this function assumes a lot of things. It assumes that when
    the path arrays are created from the ABC notation generated by generateABC.
    If they are not, the mapping will be totally wrong. See the index file for
    usage. */
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

const makeMusic = function (key) {

    if (key) KEY = key;

    NOTES_TOP = generateNotes(KEY, 0, 15, NUMBER_TOP, DURATION_TOP);
    NOTES_BOT = generateNotes(KEY, -14, 0, NUMBER_BOT, DURATION_BOT);

	/* I'm going to link the documentation right here: 
	https://paulrosen.github.io/abcjs/visual/render-abc-options.html
	The renderAbc function accepts an object filled with options for abcjs. 
	It's important to understand why we've chosen the options we have...  
	if we decide to use them */
    abcjs.renderAbc("score", generateABC(), {
        add_classes: true
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

document.querySelector(".duration_top").addEventListener("click", () => {
    DURATION_TOP /= 2;
    if (DURATION_TOP < 3) DURATION_TOP = BASE_DURATION;
    makeMusic();
})
document.querySelector(".duration_bot").addEventListener("click", () => {
    DURATION_BOT /= 2;
    if (DURATION_BOT < 3) DURATION_BOT = BASE_DURATION;
    makeMusic();
})

document.querySelector(".number_top").addEventListener("click", () => {
    NUMBER_TOP++;
    if (NUMBER_TOP > 4) NUMBER_TOP = 1;
    makeMusic();
})
document.querySelector(".number_bot").addEventListener("click", () => {
    NUMBER_BOT++;
    if (NUMBER_BOT > 4) NUMBER_BOT = 1;
    makeMusic();
})

export { cursorAdv, cursorBck, playedCorrect, makeMusic }
