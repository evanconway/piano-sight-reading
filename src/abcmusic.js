import {Chord} from "./chord";

const defaultLength = 4;

const music = {
    title: "T:",
    meter: "M:C",
    noteLength: `L:1/${defaultLength}`,
    key: "K:Eb",
    staffMarker: "%%staves {1,2}",
    staffTop: "ABDGDFEDADFG",
    staffBot: "BGFEDAFDFAFG",
    measuresPerLine: 3
}

// determine if input is a letter character
const isLetter = function(letter) {
    if (letter.length !== 1) return false;
    /* The match function takes in a regex expression. It returns an array of elements in the 
    string that match the expression. The expression below represents all letters. The function
    returns null if no elements match. */
    let match = letter.match(/[a-z]/i);
    if (match === null) return false;
    return true;
}

// Returns true if given character is one of the characters that could start an ABCjs note
const isABCStart = function(char) {
    return (isLetter(char) || char === "^" || char === "_");
}

// Returns true if given char is part of a single ABC note, this function may have been pointless...
const isABCNotePart = function (char) {
    let result = false;
    if (isABCStart(char)) result = true;
    if (char === "," || char === "'") result = true;
    return result;
}

// creates an array of individual abcjs notes from a staff
const getStaffArray = function(topOrBot) {
    /* Firstly, botOrTop is a boolean that determines if we're going to return an array of
    the top staff for true, or the bottom staff for false. */
    const staff = topOrBot ? music.staffTop : music.staffBot;
    /* We're going to iterate over every character in the staff string, adding characters to
    a temporary note string, and adding it to an array once it's complete (i.e. a new note 
    string has started). */
    const arr = [];
    let note = "";
    /* The only consistent element in every ABCjs note is a letter determining the pitch
    class. But there can be an infinite number of pre and post letter modifiers. (Technically
    there can be at most two pre modifiers, but I think it's easier to just assume infinite).
    So we can't simply add the new note once we encounter one of the characters that signify 
    the start of a new note. Those characters are: Letters, ^, and _. We can only add a note 
    if a starting character has been encountered AND the temporary note has found a letter 
    character. */
    let hasLetter = false;

    /* Before continuing, we should make notes about triplets, duples, etc... The current
    implementation splits up the staff string into individual notes, but finding time
    for individual notes doesn't work with ABCjs triplet notation. This is because triplets
    use syntax at the start of the group of notes, but the rest of the notes are notated
    like normal. For now, we're going to ignore triplets. But when we add them, we'll 
    likely have to calculate triplets all at once, or modify our getTime function to 
    require a parameter indicating it's part of a triplet or something. */

    // now for the loop
    for (let i = 0; i < staff.length; i++) {
        let c = staff[i];
        // the logic is different if we've found a letter
        if (hasLetter) {
            /* In the case a letter has been found, we finish the note if the current
            character is a starting character, continue as normal otherwise*/
            if (isABCStart(c)) {
                arr.push(note);
                note = c;
                hasLetter = isLetter(c);
            } else note += c;
        } else {
            /* If a letter has not been found, we determine if the current character
            is a letter, and add it regardless.*/
            note += c;
            hasLetter = isLetter(c);
        }
    }
    arr.push(note); // add last note
    return arr;
}

// returns length of time of each measure as a number
const getMeasureTime = function() {
    const meter = music.meter.slice(2, music.meter.length);
    if (meter === "C") return 1;
    const numerator = meter.split("/")[0];
    const denominator = meter.split("/")[1];
    return +numerator / +denominator; // + is shorthand to convert string to number
}

// returns the default note length set in the music object
const getMusicDefaultLength = function() {
    const length = music.noteLength.slice(2, music.noteLength.length);
    if (length.indexOf("/") < 0) return +length;
    const numerator = length.split("/")[0];
    const denominator = length.split("/")[1];
    return +numerator / +denominator; // + is shorthand to convert string to number
}

// returns length of time of abc note string as number
const getNoteTime = function(abcNote) {
    let divide = false;
    let number = "";
    for (let i = 0; i < abcNote.length; i++) {
        if (abcNote[i] === "/") divide = true;
        if (!isNaN(abcNote[i])) number += abcNote[i];
    }
    number = +number;
    // At this point, if number is not 0, we are returning a modification of the default note length.
    if (number === 0) return getMusicDefaultLength();
    if (divide) return getMusicDefaultLength() / number;
    else return getMusicDefaultLength() * number;
}

const generateABC = function() {
    let result = music.title + "\n";
    result += music.meter + "\n";
    result += music.noteLength + "\n";
    result += music.key + "\n";
    /* The staff marker is syntax that declares 2 staves that we can write
    notation to. After experimenting, it looks like writing `V:` lets us
    declare which staff we're writing to. The default cleff of a staff is
    treble, and we can change this with clef=bass inside of []. But it
    also appears we have to set the key again as well. So the full line
    should be [K:A clef=bass]. Since we have to do this for each new line,
    I think it makes the most sense to just redeclare both staves after 
    each line break. */
    result += music.staffMarker + "\n";
    const headerTop = `V:1\n[K:${music.key} clef=treble]\n`;
    const headerBot = `V:2\n[K:${music.key} clef=bass]\n`;
    /* Now comes line generation. First, we're not going to reference the staff
    strings themselves, we'll be using our array functions so we can easily refer
    to individual notes. */
    const notesTop = getStaffArray(true);
    const notesBot = getStaffArray(false);
    /* We're going to iterate over these two arrays, creating lines and measures
    from them. Lines are determined by number of measures. Measures are determined
    by note length and meter. Using two separate indices, one for each staff/array,
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
            for (let time = 0; time < getMeasureTime() && iTop < notesTop.length; iTop++) {
                lineTop += notesTop[iTop];
                time += getNoteTime(notesTop[iTop]);
            }
            lineTop += "|";
        }
        // generate bottom line, same logic as top
        let lineBot = "";
        for (let m = 0; m < music.measuresPerLine && iBot < notesBot.length; m++) {
            for (let time = 0; time < getMeasureTime() && iBot < notesBot.length; iBot++) {
                console.log(`Notes bot at ${iBot} is ${notesBot[iBot]}`);
                lineBot += notesBot[iBot];
                time += getNoteTime(notesBot[iBot]);
            }
            console.log("Measure created!");
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
    return result;
}

const midiToABC = function(midi, useflats=false) {
    /* Since we're mostly just worried about piano data, the lowest midi note value
    we'll recieve is 21 for A0, and the highest is 108 for C8*/
    let note = "";
    // first we determine the pitch class
    let pClass = midi % 12;
    switch (pClass) {
        case 0:
            note = "C";
            break;
        case 1:
            note = useflats ? "_D" : "^C";
            break;
        case 2:
            note = "D";
            break;
        case 3:
            note = useflats ? "_E" : "^D";
            break;
        case 4:
            note = "E";
            break;
        case 5:
            note = "F";
            break;
        case 6:
            note = useflats ? "_G" : "^F";
            break;
        case 7:
            note = "G";
            break;
        case 8:
            note = useflats ? "_A" : "^G";
            break;
        case 9:
            note = "A";
            break;
        case 10:
            note = useflats ? "_B" : "^A";
            break;
        case 11:
            note = "B";
            break;
    }
    // then we determine the pitch register
    let pReg = midi - pClass;
    switch (pReg) {
        case 12:
            note += ",,,,";
            break;
        case 24:
            note += ",,,";
            break;
        case 36:
            note += ",,";
            break;
        case 48:
            note += ",";
            break;
        case 60:
            // no change needed, middle register!
            break;
        case 72:
            note += "'";
            break;
        case 84:
            note += "''";
            break;
        case 96:
            note += "'''";
            break;
        case 108:
            note += "''''";
            break;
    }
    return note;
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

console.log(getStaffArray(true));
console.log(getStaffArray(false));

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
