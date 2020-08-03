const midiToABC = function (midi = 60, useflats = false) {
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

class Chord { 
    constructor(duration) {
        this.pitches = []; // pitches are midi pitch values, not ABCjs strings.
        this.duration = duration; // the ABC modifier for the default length
    }

    addPitch(pitch) {
        this.pitches.push(pitch);
    }

    getABCString(key) {
        let useflats = (key === "F" || (key.length > 1 && key[1] === "b"));
        if (this.pitches.length === 0) return null; // maybe we could use length 0 to represent rests??
        if (this.pitches.length === 1) return midiToABC(this.pitches[0], useflats) + this.duration.toString();
        let result = "[";
        this.pitches.forEach(e => result += midiToABC(e, useflats));
        result += "]" + this.duration.toString();
        return result;
    }
}

const generateTest = function (topOrBot = true, numOfPitches = 1) {
    const m = 1;
    const noteNum = 4 * 16;
    const arr = [];
    for (let i = 0; i < noteNum; i++) {
        let c = new Chord(m);
        let pitchMod = Math.floor(20 * Math.random());
        for (let j = 0; j < numOfPitches; j++) {
            if (topOrBot) c.addPitch(60 + pitchMod);
            else c.addPitch(60 - pitchMod);
        }
        arr.push(c);
    }
    return arr;
}

export { midiToABC, Chord, generateTest}
