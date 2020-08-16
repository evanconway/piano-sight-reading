const KEY_SIGNATURES = new Map();

/* The key for these maps is a scale degree. The value is an array
containing the string for the pitch class of that degree, and the
base midi value for the pitch class. Observe that the string is 
the note as we'd draw it in that key. For example, F# in G major 
actually gets drawn as normal F. The midi value, however, is still
F#. */

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const SHARPS = ["F", "C", "G", "D", "A", "E", "B", "^"];
const FLATS = ["B", "E", "A", "D", "G", "C", "F", "_"];

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
for each key by simply starting with the root pitch. For the major
and minor functions, the rootMidi is the base midi value of the 
root of the scale, and the rootStaff is the index of the root
on the staff. The accidental arr is one of the two arrays above, which
defines the scale as using flats or sharps. Accidental_num is the number
of elements from this array that are included in the key. */

const getAccidentalArray = function(accidental_arr, accidental_num) {
    let arr = new Array(accidental_num + 1);
    for (let i = 0; i < accidental_num; i++) arr[i] = accidental_arr[i];
    arr[arr.length - 1] = accidental_arr[accidental_arr.length - 1] // the last element is the accidental of this key 
    return arr;
}

const makeScaleMajor = function(rootLetter, rootMidi, rootStaff, accidental_arr = SHARPS, accidental_num = 0) {
    const SCALE = new Map();
    let indexL = LETTERS.indexOf(rootLetter);
    SCALE.set(1, [LETTERS[indexL++], rootMidi]);
    SCALE.set(2, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 2)]);
    SCALE.set(3, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 4)]);
    SCALE.set(4, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 5)]);
    SCALE.set(5, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 7)]);
    SCALE.set(6, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 9)]);
    SCALE.set(7, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 11)]);
    SCALE.set("staff_root", rootStaff);
    SCALE.set("accidentals", getAccidentalArray(accidental_arr, accidental_num));
    return SCALE;
}

const makeScaleMinor = function (rootLetter, rootMidi, rootStaff, accidental_arr = SHARPS, accidental_num = 0) {
    const SCALE = new Map();
    let indexL = LETTERS.indexOf(rootLetter);
    SCALE.set(1, [LETTERS[indexL++], rootMidi]);
    SCALE.set(2, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 2)]);
    SCALE.set(3, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 3)]);
    SCALE.set(4, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 5)]);
    SCALE.set(5, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 7)]);
    SCALE.set(6, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 8)]);
    SCALE.set(7, [LETTERS[lettersWrap(indexL++)], midiWrap(rootMidi + 10)]);
    SCALE.set("staff_root", rootStaff);
    SCALE.set("accidentals", getAccidentalArray(accidental_arr, accidental_num));
    return SCALE;
}

// major keys
KEY_SIGNATURES.set("C", makeScaleMajor("C", 0, 0));
KEY_SIGNATURES.set("G", makeScaleMajor("G", 7, 4, SHARPS, 1));
KEY_SIGNATURES.set("D", makeScaleMajor("D", 2, 1, SHARPS, 2));
KEY_SIGNATURES.set("A", makeScaleMajor("A", 9, 5, SHARPS, 3));
KEY_SIGNATURES.set("E", makeScaleMajor("E", 4, 2, SHARPS, 4));
KEY_SIGNATURES.set("B", makeScaleMajor("B", 11, 6, SHARPS, 5));
KEY_SIGNATURES.set("F#", makeScaleMajor("F", 6, 3, SHARPS, 6));
KEY_SIGNATURES.set("C#", makeScaleMajor("C", 1, 0, SHARPS, 7));
KEY_SIGNATURES.set("F", makeScaleMajor("F", 5, 3, FLATS, 1));
KEY_SIGNATURES.set("Bb", makeScaleMajor("B", 10, 6, FLATS, 2));
KEY_SIGNATURES.set("Eb", makeScaleMajor("E", 3, 2, FLATS, 3));
KEY_SIGNATURES.set("Ab", makeScaleMajor("A", 8, 5, FLATS, 4));
KEY_SIGNATURES.set("Db", makeScaleMajor("D", 1, 1, FLATS, 5));
KEY_SIGNATURES.set("Gb", makeScaleMajor("G", 6, 4, FLATS, 6));
KEY_SIGNATURES.set("Cb", makeScaleMajor("C", 11, 0, FLATS, 7));

// minor keys
KEY_SIGNATURES.set("Am", makeScaleMinor("A", 9, 5));
KEY_SIGNATURES.set("Em", makeScaleMinor("E", 4, 2, SHARPS, 1));
KEY_SIGNATURES.set("Bm", makeScaleMinor("B", 11, 6, SHARPS, 2));
KEY_SIGNATURES.set("F#m", makeScaleMinor("F", 6, 3, SHARPS, 3));
KEY_SIGNATURES.set("C#m", makeScaleMinor("C", 1, 0, SHARPS, 4));
KEY_SIGNATURES.set("G#m", makeScaleMinor("G", 8, 4, SHARPS, 5));
KEY_SIGNATURES.set("D#m", makeScaleMinor("D", 3, 1, SHARPS, 6));
KEY_SIGNATURES.set("A#m", makeScaleMinor("A", 10, 5, SHARPS, 7));
KEY_SIGNATURES.set("Dm", makeScaleMinor("D", 2, 1, FLATS, 1));
KEY_SIGNATURES.set("Gm", makeScaleMinor("G", 7, 4, FLATS, 2));
KEY_SIGNATURES.set("Cm", makeScaleMinor("C", 0, 0, FLATS, 3));
KEY_SIGNATURES.set("Fm", makeScaleMinor("F", 5, 3, FLATS, 4));
KEY_SIGNATURES.set("Bbm", makeScaleMinor("B", 10, 6, FLATS, 5));
KEY_SIGNATURES.set("Ebm", makeScaleMinor("E", 3, 2, FLATS, 6));
KEY_SIGNATURES.set("Abm", makeScaleMinor("A", 8, 5, FLATS, 7));

export { KEY_SIGNATURES, LETTERS }