const midiToABC = function (midi = 60, key = "C") {
    let useflats = (key === "F" || (key.length > 1 && key[1] === "b"));
    
    let note = "";
    let pClass = midi % 12; // short of pitch class

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

class Chord { 
    constructor(duration) {
        this.pitches = []; // pitches are midi pitch values, not ABCjs strings.
        /* We should elaborate on duration here. Duration is actually a multiplier
        of DEFAULT_DURATION in the abcjs file. Recall that DEFAULT_DURATION is 
        actually the denominator of our default note length in abcjs. So if our
        DEFAULT_DURATION is 48, a quarter note should have a duration of 12, and
        eighth note a duration of 6, and a whole note a duration of 48. */
        this.duration = duration; // the ABC modifier for the default length
        this.path = null; // reference to the html element of the note
        this.timingIndex = null; // index this note exists in the timing array
    }

    addPitch(pitch) {
        this.pitches.push(pitch);
    }

    getABCString(key) {
        if (this.pitches.length === 0) return null; // maybe we could use length 0 to represent rests??
        if (this.pitches.length === 1) return midiToABC(this.pitches[0], key) + this.duration.toString();
        let result = "[";
        this.pitches.forEach(e => result += midiToABC(e, key));
        result += "]" + this.duration.toString();
        return result;
    }
}

// returns a random midi note in the given key.
const generateNote = function(key, min, max) {
    /* Some notes about midi pitches: Each octave is divided into 12 pitches. They can be thought
    of as starting at the C 5 octaves below middle C. This means that middle C is the value 60. 
    We will think of our pitch classes in terms of the bottom octave, so C is 0, D is 2, E is 4,
    and so on. This allows us to create our pitches by adding/subtracting octaves and the pitch
    class from 60, middle C. This works well for us because abcjs uses the middle C octave as the
    default location for pitches. Check the ABCjs documentation for syntax for key signatures. We 
    are going to assign the valid pitch classes manually. */

    let pitchClassOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // the default if given key is not valid
    if (key === "C" || key === "Am") pitchClassOptions = [0, 2, 4, 5, 7, 9, 11];
    if (key === "G" || key === "Em") pitchClassOptions = [0, 2, 4, 6, 7, 9, 11];
    if (key === "D" || key === "Bm") pitchClassOptions = [1, 2, 4, 6, 7, 9, 11];
    if (key === "A" || key === "F#m") pitchClassOptions = [1, 2, 4, 6, 8, 9, 11];
    if (key === "E" || key === "C#m") pitchClassOptions = [1, 3, 4, 6, 8, 9, 11];
    if (key === "B" || key === "G#m") pitchClassOptions = [1, 3, 4, 6, 8, 10, 11];
    if (key === "F#" || key === "D#m") pitchClassOptions = [1, 3, 5, 6, 8, 10, 11];
    if (key === "C#" || key === "A#m") pitchClassOptions = [0, 1, 3, 5, 6, 8, 10];
    if (key === "F" || key === "Dm") pitchClassOptions = [0, 2, 4, 5, 7, 9, 10];
    if (key === "Bb" || key === "Gm") pitchClassOptions = [0, 2, 3, 5, 7, 9, 10];
    if (key === "Eb" || key === "Cm") pitchClassOptions = [0, 2, 3, 5, 7, 8, 10];
    if (key === "Ab" || key === "Fm") pitchClassOptions = [0, 1, 3, 5, 7, 8, 10];
    if (key === "Db" || key === "Bbm") pitchClassOptions = [0, 1, 3, 5, 6, 8, 10];
    if (key === "Gb" || key === "Ebm") pitchClassOptions = [1, 3, 5, 6, 8, 10, 11];
    if (key === "Cb" || key === "Abm") pitchClassOptions = [1, 3, 4, 6, 8, 10, 11];

    /* After determining what pitches are possible in the given key, we create an array of all
    pitches from the key between the min and max, inclusive. The reason i starts at 1 and ends
    at 9 is because this ensures we include notes 1 octave beyond the range of the piano in 
    either direction. That way we don't miss the top C or the bottom 3 extension notes. */
    const possiblePitches = [];
    for (let i = 1; i < 10; i++) {
        for (let j = 0; j < pitchClassOptions.length; j++) {
            let pitch = pitchClassOptions[j] + i * 12;
            if (pitch >= min && pitch <= max) possiblePitches.push(pitch);
            if (pitch > max) {
                i = 10;
                j = pitchClassOptions.length;
            }
        }
    }

    // choose a random index from this array, and return the value
    let rIndex = Math.floor(Math.random() * possiblePitches.length);
    return possiblePitches[rIndex];
}

const generateTest = function (key, topOrBot = true, numOfPitches = 1, duration = 12) {
    const noteNum = 5 * 16 / (duration / 12);
    const arr = [];
    for (let i = 0; i < noteNum; i++) {
        let c = new Chord(duration);
        for (let j = 0; j < numOfPitches; j++) {
            if (topOrBot) c.addPitch(generateNote(key, 60, 80));
            else c.addPitch(generateNote(key, 40, 60));
        }
        arr.push(c);
    }
    return arr;
}

export { midiToABC, Chord, generateTest}
