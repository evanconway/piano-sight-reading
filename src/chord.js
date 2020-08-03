class Chord { 
    constructor(length) {
        this.pitches = []; // pitches are midi pitch values, not ABCjs strings.
        this.length = length;
    }

    addPitch(pitch) {
        this.pitches.push(pitch);
    }

    getABCString() {
        if (this.pitches.length === 0) return null;
        if (this.pitches.length === 1) return this.pitches[0] + this.length;
        result = "[";
        this.pitches.forEach((e) => result += e);
        result += "]" + this.length;
        return result;
    }
}

const testTopCArr = [];
let tChord = new Chord(12);


export { Chord }
