const KEY_SIGNATURES = new Map();

/* The key for these maps is a scale degree. The value is an array
containing the string for the pitch class of that degree, and the
base midi value for the pitch class. Observe that the string is 
the note as we'd draw it in that key. For example, F# in G major 
actually gets drawn as normal F. The midi value, however, is still
F#. */

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];

// wraps given index around letters array
const lettersWrap = function(i) {
    while (i >= LETTERS.length) i-= LETTERS.length;
    return i;
}

// wraps given midi value around 11
const midiWrap = function(m) {
    while (m >= 12) m -= 12;
    return m;
}

/* Recall that all majors and minor keys are the same series of half 
and whole steps. We can easily create a map of midi values and notes
for each key by simply starting with the root pitch*/

const makeScaleMajor = function(rootLetter, rootMidi) {
    const SCALE = new Map();
    let indexL = LETTERS.indexOf(rootLetter);
    SCALE.set(1, [LETTERS[indexL++], rootMidi]);
    SCALE.set(2, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 2)]);
    SCALE.set(3, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 4)]);
    SCALE.set(4, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 5)]);
    SCALE.set(5, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 7)]);
    SCALE.set(6, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 9)]);
    SCALE.set(7, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 11)]);
    return SCALE;
}

const makeScaleMinor = function (rootLetter, rootMidi) {
    const SCALE = new Map();
    let indexL = LETTERS.indexOf(rootLetter);
    SCALE.set(1, [LETTERS[indexL++], rootMidi]);
    SCALE.set(2, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 2)]);
    SCALE.set(3, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 3)]);
    SCALE.set(4, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 5)]);
    SCALE.set(5, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 7)]);
    SCALE.set(6, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 8)]);
    SCALE.set(7, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 10)]);
    return SCALE;
}

// major keys
KEY_SIGNATURES.set("C", makeScaleMajor("C", 0));
KEY_SIGNATURES.set("G", makeScaleMajor("G", 7));
KEY_SIGNATURES.set("D", makeScaleMajor("D", 2));
KEY_SIGNATURES.set("A", makeScaleMajor("A", 9));
KEY_SIGNATURES.set("E", makeScaleMajor("E", 4));
KEY_SIGNATURES.set("B", makeScaleMajor("B", 11));
KEY_SIGNATURES.set("F#", makeScaleMajor("F", 6));
KEY_SIGNATURES.set("C#", makeScaleMajor("C", 1));
KEY_SIGNATURES.set("F", makeScaleMajor("F", 5));
KEY_SIGNATURES.set("Bb", makeScaleMajor("B", 10));
KEY_SIGNATURES.set("Eb", makeScaleMajor("E", 3));
KEY_SIGNATURES.set("Ab", makeScaleMajor("A", 8));
KEY_SIGNATURES.set("Db", makeScaleMajor("D", 1));
KEY_SIGNATURES.set("Gb", makeScaleMajor("G", 6));
KEY_SIGNATURES.set("Cb", makeScaleMajor("C", 11));

// minor keys
KEY_SIGNATURES.set("Am", makeScaleMinor("A", 9));
KEY_SIGNATURES.set("Em", makeScaleMinor("A", 4));
KEY_SIGNATURES.set("Bm", makeScaleMinor("B", 11));
KEY_SIGNATURES.set("F#m", makeScaleMinor("F", 6));
KEY_SIGNATURES.set("C#m", makeScaleMinor("C", 1));
KEY_SIGNATURES.set("G#m", makeScaleMinor("G", 8));
KEY_SIGNATURES.set("D#m", makeScaleMinor("D", 3));
KEY_SIGNATURES.set("A#m", makeScaleMinor("A", 10));
KEY_SIGNATURES.set("Dm", makeScaleMinor("D", 2));
KEY_SIGNATURES.set("Gm", makeScaleMinor("G", 7));
KEY_SIGNATURES.set("Cm", makeScaleMinor("C", 0));
KEY_SIGNATURES.set("Fm", makeScaleMinor("F", 5));
KEY_SIGNATURES.set("Bbm", makeScaleMinor("B", 10));
KEY_SIGNATURES.set("Ebm", makeScaleMinor("E", 3));
KEY_SIGNATURES.set("Abm", makeScaleMinor("A", 8));

export { KEY_SIGNATURES }