import {midiToABC, Chord, generateTest} from "./chord";

const DEFAULT_DURATION = 4;
const DEFAULT_KEY = "Bb";
const STAFF_MARKER = "%%staves {1,2}";

const music = {
    title: "",
    meter: "C",
    noteLength: DEFAULT_DURATION,
    key: DEFAULT_KEY,
    measuresPerLine: 3
}

const generateABC = function() {
    let result = `T:${music.title}\n`;
    result += `M:${music.meter}\n`;
    result += `L:1/${music.noteLength}\n`;
    result += `K:${music.key}\n`;
    /* The staff marker is syntax that declares 2 staves that we can write
    notation to. After experimenting, it looks like writing `V:` lets us
    declare which staff we're writing to. The default cleff of a staff is
    treble, and we can change this with clef=bass inside of []. But it
    also appears we have to set the key again as well. So the full line
    should be [K:A clef=bass]. Since we have to do this for each new line,
    I think it makes the most sense to just redeclare both staves after 
    each line break. */
    result += STAFF_MARKER + "\n";
    const headerTop = `V:1\n[K:${music.key} clef=treble]\n`;
    const headerBot = `V:2\n[K:${music.key} clef=bass]\n`;
    /* Now comes line generation. Our data is stored as an array of chord objects.
    These objects already convenient data like length of notes, and string generation
    functions. */
    const notesTop = generateTest();
    const notesBot = generateTest(false);
    /* We're going to iterate over these two arrays, creating lines and measures
    from them. Lines are determined by number of measures. Measures are determined
    by chord length and meter. Using two separate indices, one for each array,
    we'll create lines unil all notes in both arrays have been iterated through. */
    let iTop = 0;
    let iBot = 0;
    while (iTop < notesTop.length && iBot < notesBot.length) {
        // generate top line
        let lineTop = "";
        /* This outer loop is for generating the correct number of measures. Observe
        that we stop if the index reaches the end of the notes array*/
        for (let m = 0; m < music.measuresPerLine && iTop < notesTop.length; m++) {
            /* This inner loop is for generating a measure. Like line generation, we will 
            stop if the index reaches the end of the array. */
            for (let time = 0; time < DEFAULT_DURATION && iTop < notesTop.length; iTop++) {
                lineTop += notesTop[iTop].getABCString(DEFAULT_KEY);
                time += notesTop[iTop].duration;
            }
            lineTop += "|";
        }
        // generate bottom line, same logic as top
        let lineBot = "";
        for (let m = 0; m < music.measuresPerLine && iBot < notesBot.length; m++) {
            for (let time = 0; time < DEFAULT_DURATION && iBot < notesBot.length; iBot++) {
                lineBot += notesBot[iBot].getABCString(DEFAULT_KEY);
                time += notesBot[iBot].duration;
            }
            lineBot += "|";
        }
        // add final bar if line is final line (indices are at end)
        if (iTop === notesTop.length) lineTop += "]";
        if (iBot === notesBot.length) lineBot += "]";
        // add lines
        result += headerTop;
        result += lineTop + "\n";
        result += headerBot;
        result += lineBot + "\n";
    }
    console.log(result);
    return result;
}

const getMidiTiming = function() {
    
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

const pianoEX = `
T:Piano Music
M:C
L:1/4
K:A
%%staves {1,2}
V:1
AAAA|FACA|ABCD|GFBD
V:2
[K:A clef=bass]
G,,B,,D,,E,,|F,,A,,C,,A,,|A,,B,,C,,D,,|G,,F,,B,,D,,
V:1
[K:A clef=treble]
GBDE|FACA|ABCD|GFBD
V:2
[K:A clef=bass]
G,,B,,D,,E,,|F,,A,,C,,A,,|A,,B,,C,,D,,|G,,F,,B,,D,,
`
const testABC = `
T:Piano Music
M:C
L:1/4
K:A
%%staves {1,2}
V:2
AAAAAAAAAAAAAAAA
V:2
K:B
M:6/8
CCCCCBBB
V:2
FFFFFFFFFFFFFFFF
V:1
BBBBBBBBBBBBBBBB
`

export { testABC, pianoEX, music, midiToABC, abcToMidi, generateABC }

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
