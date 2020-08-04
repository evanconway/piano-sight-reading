import {midiToABC, Chord, generateTest} from "./chord";

// music consts
const BASE_DURATION = 48; // this is actually the denominator of the default timing
const TITLE = "Sight Reading";
const METER = "C";
const KEY = "Bb";
const NOTES_TOP = generateTest(true);
const NOTES_BOT = generateTest(false, 2, 24);
const MEASURES_PER_LINE = 4;
const MIDI_TIMING_ARRAY = []; // setup in generateMidiTimingArr()

let playCursor = 0;
const COLOR_SELECT = "#00AA00";
const COLOR_DEF = "#000000";

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

// move cursor forward to next valid set of notes
const cursorAdv = function() {
    playCursor++;
    while (MIDI_TIMING_ARRAY[playCursor] === null && playCursor < MIDI_TIMING_ARRAY.length) playCursor++;
    if (playCursor === MIDI_TIMING_ARRAY.length) playCursor = 0;
    cursorSet(playCursor);
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
            stop if the index reaches the end of the array. */
            for (let time = 0; time < BASE_DURATION && iTop < NOTES_TOP.length; iTop++) {
                lineTop += NOTES_TOP[iTop].getABCString(KEY);
                time += NOTES_TOP[iTop].duration;
            }
            lineTop += "|";
        }
        // generate bottom line, same logic as top
        let lineBot = "";
        for (let m = 0; m < MEASURES_PER_LINE && iBot < NOTES_BOT.length; m++) {
            for (let time = 0; time < BASE_DURATION && iBot < NOTES_BOT.length; iBot++) {
                lineBot += NOTES_BOT[iBot].getABCString(KEY);
                time += NOTES_BOT[iBot].duration;
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
    console.log("iTop is " + iTop);
    console.log("iBot is " + iBot);
    return result;
}

// this function is identical to the one above, but it does not insert line breaks.
const generateABCOneLine = function () {
    let result = "";
    result += `M:${METER}\n`;
    result += `L:1/${BASE_DURATION}\n`;
    result += `T:${TITLE}\n`;
    result += `%%staves {1 2}\n`;
    result += `V:1 clef=treble\n`;
    result += `V:2 clef=bass\n`;
    result += `K:${KEY}\n`;

    // generate top line
    let lineTop = "";
    for (let i = 0, time = 0; i < NOTES_TOP.length; i++) {
        lineTop += NOTES_TOP[i].getABCString(KEY); // recall that elements of notesTop are chord objects
        time += NOTES_TOP[i].duration;
        if (time >= BASE_DURATION) {
            lineTop += "|";
            time = 0;
        }
    }
    if (lineTop[lineTop.length - 1] !== "|") lineTop += "|"; // ensure measure at end

    // same logic for bottom line
    let lineBot = "";
    for (let i = 0, time = 0; i < NOTES_BOT.length; i++) {
        lineBot += NOTES_BOT[i].getABCString(KEY);
        time += NOTES_BOT[i].duration;
        if (time >= BASE_DURATION) {
            lineBot += "|";
            time = 0;
        }
    }
    if (lineBot[lineBot.length - 1] !== "|") lineBot += "|"; // ensure measure at end

    // add final bar lines
    lineTop += "]";
    lineBot += "]";

    // add lines
    result += `[V:1] ` + lineTop + "\n";
    result += `[V:2] ` + lineBot + "\n";
    
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
        e.pitches.forEach(pitch => MIDI_TIMING_ARRAY[index].push(pitch));
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
        e.pitches.forEach(pitch => MIDI_TIMING_ARRAY[index].push(pitch));
        index += e.duration;
    })
    return MIDI_TIMING_ARRAY
}

const abcToMidi = function(abc) {
    // recall that `abc` is a string for ABCjs code

    // determine accidental
    let acc = 0;
    if (abc[0] === '^') acc = 1;
    if (abc[0] === '_') acc = -1;

    // determine "letter" of pitch
    let pitchL = (acc) ? abc[1] : abc[0];

    // use pitchL to determine register
    let pReg = 60; // 60 is the default register
    for (let i = abc.length - 1; abc[i] !== pitchL; i--) {
        if (abc[i] === "'") pReg += 12;
        if (abc[i] === ",") pReg -= 12;
    }

    // determine int value of the pitch class
    let pClass = 0;
    switch (pitchL) {
        case "C":
            pClass = 0;
            break;
        case "D":
            pClass = 2;
            break;
        case "E":
            pClass = 4;
            break;
        case "F":
            pClass = 5;
            break;
        case "G":
            pClass = 7;
            break;
        case "A":
            pClass = 9;
            break;
        case "B":
            pClass = 11;
            break;
    }

    // final midi value is the combined register, class, and accidental modifier
    return pClass + pReg + acc;
}

export { midiToABC, abcToMidi, generateABCOneLine, generateABC, assignPaths, generateMidiTimingArr, cursorSet, cursorAdv, cursorBck}

// -------------------- TESTS --------------------

function test_abcToMidi(note, expected) {
    let midi = abcToMidi(note);
    if (midi != expected) {
        console.log(`Error, got ${note} and expected ${expected} but returned ${midi}`)
    } else {
        console.log(`test passed`)
    }
}

test_abcToMidi('C', 60);
test_abcToMidi('D', 62);
test_abcToMidi('_C', 59);
test_abcToMidi('^C', 61);
test_abcToMidi("^C'", 73);
test_abcToMidi("^C,", 49);
test_abcToMidi("_D,", 49);

function test_midiToABC(midi, expected, useflats=false) {
    let note = midiToABC(midi, useflats);
    if (note != expected) {
        console.log(`Error, got ${midi} and expected ${expected} but returned ${note}`)
    } else {
        console.log(`test passed`)
    }
}

test_midiToABC(60, 'C');
test_midiToABC(62, 'D');
test_midiToABC(58, '_B');
test_midiToABC(61, '^C');
test_midiToABC(73, "^C'");
test_midiToABC(49, "^C,");
test_midiToABC(49, "_D,", true);


const get_key_sig_normalizer = (sig) => (note) => {
    if (note in sig) {
        return note.slice(1)
    } else {
        note
    }
}
