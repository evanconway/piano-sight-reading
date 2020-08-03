const midiToABC = function (midi, useflats = false) {
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

// returns true if given key signature uses sharps
const keyUsesSharps = function(key) {
    result = false;
    if (key === "C") result = true; // not sure about chromatic randomness
    if (key === "G") result = true;
    if (key === "D") result = true;
    if (key === "A") result = true;
    if (key === "E") result = true;
    if (key === "B") result = true;
    if (key[1] === "#") result = true;
    return result;
}

const keyUsesFlats = function(key) {
    return (key === "F" || key[1] === "b");
}

class Chord { 
    constructor(length) {
        this.pitches = []; // pitches are midi pitch values, not ABCjs strings.
        this.length = length;
    }

    addPitch(pitch) {
        this.pitches.push(pitch);
    }

    getABCString(key) {
        
    }
}

const testCArrTop = [];
for (let i = 0; i < 24; i++) {
    let c = new Chord(12);
    c.addPitch(60 + Math.floor(20 * Math.random()));
    testCArrTop.push(c);
}

const testCArrBot = [];
for (let i = 0; i < 24; i++) {
    let c = new Chord(12);
    c.addPitch(60 - Math.floor(20 * Math.random()));
    testCArrBot.push(c);
}

export { midiToABC, Chord, testCArrTop, testCArrBot }
