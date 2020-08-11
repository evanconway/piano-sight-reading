import { KEY_SIGNATURES } from "./keysigs"

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

class Pitch {
    constructor(key, scaleDegree, register) {
        this.key = key;
        this.scaleDegree = scaleDegree;

        /* The midi value stored in the key signatures map is only the correct
        pitch class. We now need to get the correct midi value using the given
        register*/
        this.midi = KEY_SIGNATURES.get(key).get(scaleDegree)[1];
        for (let i = 0; i <= register; i++) this.midi += 12;

        /* Similar to the midi value, we have to create the correct ABCjs string
        using the given register. */
        this.string = KEY_SIGNATURES.get(key).get(scaleDegree)[0];
        if (register < 4) for (let i = 4; i > register; i--) this.string += ",";
        else for (let i = 4; i < register; i++) this.string += "'";
    }
}

class Chord { 
    constructor(duration) {
        this.pitches = []; // pitches are pitch objects
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

    getABCString() {
        if (this.pitches.length === 0) return null; // maybe we could use length 0 to represent rests??
        if (this.pitches.length === 1) return this.pitches[0].string + this.duration.toString();
        let result = "[";
        this.pitches.forEach(e => result += e.string);
        result += "]" + this.duration.toString();
        return result;
    }
}

// returns a random pitch in the given key.
const generateNote = function(key, minReg, maxReg) {
    let scaleDegree = 1 + Math.floor(Math.random() * 6);
    let register = minReg + Math.floor(Math.random() * (maxReg - minReg + 1));
    return new Pitch(key, scaleDegree, register);
}

const generateTest = function (key, topOrBot = true, numOfPitches = 1, duration = 12) {
    const noteNum = 5 * 16 / (duration / 12);
    const arr = [];
    for (let i = 0; i < noteNum; i++) {
        let c = new Chord(duration);
        for (let j = 0; j < numOfPitches; j++) {
            if (topOrBot) c.addPitch(generateNote(key, 4, 5));
            else c.addPitch(generateNote(key, 2, 3));
        }
        arr.push(c);
    }
    return arr;
}

export { Chord, generateTest}
