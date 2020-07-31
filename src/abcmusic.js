const music = {
    title: "T:",
    meter: "M:12/8",
    noteLength: "L:1/4",
    key: "K:Eb",
    staffMarker: "%%staves {1,2}",
    staffTop: "abcd/2 e/2fga",
    staffBot: "G,B,DEF,A,C,A,",
    measuresPerLine: 5
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

const generateABC = function() {
    let result = music.title + "\n";
    result += music.meter + "\n";
    result += music.noteLength + "\n";
    result += music.key + "\n";
    result += music.staffMarker + "\n";

    /* The staff marker is syntax that declares 2 staves that we can write
    notation to. After experimenting, it looks like writing `V:` lets us
    declare which staff we're writing to. The default cleff of a staff is
    treble, and we can change this with clef=bass inside of []. But it
    also appears we have to set the key again as well. So the full line
    should be [K:A clef=bass]. Since we have to do this for each new line,
    I think it makes the most sense to just redeclare both staves after 
    each line break.

    I think the best way to handle line breaks is to copy the staff strings
    into new strings, and then slowly pick them apart, inserting measures 
    where needed. This means we need a way to A: determine the length in
    time of a given abc note and B: determine the length of time of measures
    given the M: tag in the header.
    */



    let tempTop = music.staffTop;
    let tempBot = music.staffBot;


    result += "V:1\n";
    result += music.staffTop + "\n";
    result += "V:2\n";
    result += `[K:${music.key} clef=bass]\n`;
    result += music.staffBot + "\n";

    return result;
}

// returns length of time of each measure as a number
const getMeasureTime = function() {
    const meter = music.meter.slice(2, music.meter.length);
    if (meter === "C") return 1;
    const numerator = meter.split("/")[0];
    const denominator = meter.split("/")[1];
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

// returns the default note length set in the music object
const getMusicDefaultLength = function() {
    const length = music.noteLength.slice(2, music.noteLength.length);
    if (length.indexOf("/") < 0) return +length;
    const numerator = length.split("/")[0];
    const denominator = length.split("/")[1];
    return +numerator / +denominator; // + is shorthand to convert string to number
}

// creates an array of individual abcjs notes from the top staff
const getStaffArrayTop = function() {
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
    /* Before we begin the loop, we're going to get the note started with the first character.
    If the first character is a letter, we need to set `hasLetter` to true so that if another
    starting character is encountered, we can add note to the array and begin the process 
    again.*/
    note = music.staffTop[0];
    hasLetter = isLetter(note);

    // now for the loop
    for (let i = 1; i < music.staffTop.length; i++) {
        let c = music.staffTop[i];
        // the logic is different if we've found a letter
        if (hasLetter) {
            /* In the case a letter has been found, we add the note if a starting character
            is discovered. */
        }
    }
    arr.push(note); // add last note
    return arr;
}

// Returns true if given character is one of the characters that could start an ABCjs note
const isABCStart = function(char) {
    return (isLetter(char) || char === "^" || char === "_");
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

/* Since we're mostly just worried about piano data, the lowest midi note value 
we'll recieve is 21 for A0, and the highest is 108 for C8*/
const midiToABC = function(midi, useflats=false) {
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

export { testABC, pianoEX, music, midiToABC, abcToMidi, generateABC }

// -------------------- TESTS --------------------

console.log(isLetter("Z"));

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
