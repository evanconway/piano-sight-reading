import { KEY_SIGNATURES } from "./keysigs"

// add all key signatures to key signature drop down
let options = ""
KEY_SIGNATURES.forEach((val, key) => {
    options += `<option value="${key}">${key}</option>`;
})
const KEY_MENU = document.querySelector("select");
KEY_MENU.innerHTML = options;

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
// returns the note equivalent of the given key and staff index
const getPitchFromIndex = function(key, index) {
    /* The first step is to determine the register of this index. We do this by simply 
    subracting (or adding in the case of negative index) the value of a register (7), 
    until the index is between 0 and 7. We will then now how far away from register 4 
    the index is, and can determine it's register. */
    let register = 0;
    if (index >= 0) {
        while (index > 6) {
            index -= 7;
            register++;
        }
    } else {
        while (index < 0) {
            index += 7;
            register--;
        }
    }
    register += 4;
    /* Register is now correct, and the index has been modified to be the equivalent pitch
    class, but in register 4. We can now determine the scale degree of the note using the
    given key and the index. Recall that each key has a "staff_root" element, which is the
    staff index of the root of the key. We can count "down" from the index, wrapping around
    -1 to 6, and incrementing our scale degree by one each decrement. Once our index is
    equal to our staff_root, we will have found the scale degree of the index */
    let scaleDegree = 1;
    while (index !== KEY_SIGNATURES.get(key).get("staff_root")) {
        index--;
        if (index < 0) index = 6;
        scaleDegree++;
    }
    
    return new Pitch(key, scaleDegree, register);
}

// returns a random pitch in the given key between min (inclusive) and max (exclusive)
const generateNote = function(key, indMin, indMax) {
    /* To create a random index, first we create a range starting at 0 of the same size as
    the range between min and max. Next we choose a random index in that range. Finally
    we add min to the chosen index to move index within the range of min and max. For 
    example, let's say the min and max is -3 to 3. The 0 based equivalent range is 0 to 6. 
    And let's say our randomly chosen index is 1. We then add min, which is -3, to that 
    value to obtain our final index, -2. */
    let range = indMax - indMin;
    let index = Math.floor(Math.random() * range);
    index += indMin;
    return getPitchFromIndex(key, index);
}

const generateNotes = function (key, topOrBot = true, numOfPitches = 1, duration = 12) {
    const noteNum = 5 * 16 / (duration / 12);
    const arr = [];
    for (let i = 0; i < noteNum; i++) {
        let c = new Chord(duration);
        for (let j = 0; j < numOfPitches; j++) {
            if (topOrBot) c.addPitch(generateNote(key, 0, 3));
            else c.addPitch(generateNote(key, -2, 1));
        }
        arr.push(c);
    }
    return arr;
}

export { Chord, generateNotes}
