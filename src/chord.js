import { KEY_SIGNATURES, LETTERS, CHORDS } from "./keysigs"

// add all key signatures to key signature drop down
let options = ""
KEY_SIGNATURES.forEach((val, key) => {
    options += `<option value="${key}">${key}</option>`;
})
const KEY_MENU = document.querySelector(".keys");
KEY_MENU.innerHTML = options;

class Pitch {
    constructor(key, staffIndex, alter = 0) {
        this.key = key;
        this.staffIndex = staffIndex;

        /* To determine the register of this note, we determine how far away
        it is from register 4. We do this by subtracting (or adding in the case of
        a negative index) the value of a register (7) until the index is between
        0 and 7. */
        this.register = 0;
        if (staffIndex >= 0) {
            while (staffIndex > 6) {
                staffIndex -= 7;
                this.register++;
            }
        } else {
            while (staffIndex < 0) {
                staffIndex += 7;
                this.register--;
            }
        }
        this.register += 4;

        /* Register is now correct, and the index has been modified to be the equivalent pitch
        class, but in register 4. We can now determine the scale degree of the note using the
        given key and the index. Recall that each key has a "staff_root" element, which is the
        staff index of the root of the key. We can count "down" from the index, wrapping around
        -1 to 6, and incrementing our scale degree by one each decrement. Once our index is
        equal to our staff_root, we will have found the scale degree of the index */
        this.scaleDegree = 1;
        while (staffIndex !== KEY_SIGNATURES.get(key).get("staff_root")) {
            staffIndex--;
            if (staffIndex < 0) staffIndex = 6;
            this.scaleDegree++;
        }

        /* The midi value stored in the key signatures map is only the correct pitch class. We now 
        need to get the correct midi value using our newly calculated register and scale degree. 
        Recall each element in a scale is an array, the first element being the letter, the second 
        being the base midi value. */
        this.midi = KEY_SIGNATURES.get(key).get(this.scaleDegree)[1];
        for (let i = 0; i <= this.register; i++) this.midi += 12;

        /* Now we make two strings for the pitch. One is the string that is given to the ABCjs
        render function, the other is the default accidental of the pitch. We need to know the 
        accidental so that if we mark a pitch as raised or lowered, we know what accidental to 
        apply. Note that we'll be using the ABCjs characters for sharp and flat. For example, 
        the raised root in C major uses a sharp instead of a natural (=C -> ^C).  
        But the raised root in Bb major uses a natural instead of a flat (_B -> =B). */

        /* Recall each element in a scale is an array, the first element being the letter, the
        second being the base midi value. */
        let letter = KEY_SIGNATURES.get(key).get(this.scaleDegree)[0];

        /* We make the ABCjs string by appending the correct register mark the correct number
        of times. */
        this.string = letter;
        if (this.register < 4) for (let i = 4; i > this.register; i--) this.string += ",";
        else for (let i = 4; i < this.register; i++) this.string += "'";

        /* We make the string with the true accidental by adding the keys accidental if letter
        is included in the scales "accidentals" array. */
        this.defaultAccidental = "";
        let acc_arr = KEY_SIGNATURES.get(key).get("accidentals");
        if (acc_arr.includes(letter)) this.defaultAccidental += acc_arr[acc_arr.length - 1];
        else this.defaultAccidental += "="; // default is a natural

        /* Finally, we'll make any given alterations to the note. This is either raising or lowering
        the pitch. A positive number means raising the pitch, negative means lower, and 0 means no
        alteration. Note that we must change the midi value and string for our other code to work. */
        // raise pitch
        if (alter > 0) {
            this.midi += 1;
            if (this.defaultAccidental === "_") this.string = "=" + this.string;
            else if (this.defaultAccidental === "=") this.string = "^" + this.string;
            else this.string = "^^" + this.string;
        }
        // lower pitch
        if (alter < 0) {
            this.midi -= 1;
            if (this.defaultAccidental === "^") this.string = "=" + this.string;
            else if (this.defaultAccidental === "=") this.string = "_" + this.string;
            else this.string = "__" + this.string;
        }
    }
}

// returns a string of the pitch class and register equivalent of the given staff index
const getPitchStringFromIndex = function (index) {
    let register = 4;
    if (index >= 0) {
        while (index >= 7) {
            index -= 7;
            register++;
        }
    } else {
        while (index < 0) {
            index += 7;
            register--;
        }
    }
    let string = LETTERS[index] + register.toString();
    if (string === "F5") string += " -";
    if (string === "E4") string += " -";
    if (string === "C4") string += " *";
    if (string === "A3") string += " -";
    if (string === "G2") string += " -";
    return string;
}

// returns all valid staff indicies for a given harmony/chord and min/max indicies
const getChordOptions = function (key = "C", min = -15, max = 15, harmony = null) {

    /* Get an equivalent int from the numeral. Note that we're not worrying about
    chord quality right now. */
    let chordInt = null;
    if (harmony !== null) {
        if (harmony.startsWith("I") || harmony.startsWith("i")) chordInt = 1;
        if (harmony.startsWith("II") || harmony.startsWith("ii")) chordInt = 2;
        if (harmony.startsWith("III") || harmony.startsWith("iii")) chordInt = 3;
        if (harmony.startsWith("IV") || harmony.startsWith("iv")) chordInt = 4;
        if (harmony.startsWith("V") || harmony.startsWith("v")) chordInt = 5;
        if (harmony.startsWith("VI") || harmony.startsWith("vi")) chordInt = 6;
        if (harmony.startsWith("VII") || harmony.startsWith("vii")) chordInt = 7;
    }

    /* If chordInt is still null, then no valid harmony was given. In that case the
    pitch options will simply be all indices between min and max inclusive. */
    if (chordInt === null) {
        let options = new Array(max - min + 1);
        for (let i = 0; i < options.length; i++) options[i] = i + min;
        return options;
    }

    /* However if a valid harmony was given, we can begin finding the options that
    fit within the harmony. First, we construct an array of valid scale degrees. Recall 
    that all elements in the chord are separated by a third, hence the plus 2. */
    let arr = [];
    arr[0] = chordInt; // assign root of chord.
    arr[1] = arr[0] + 2;
    arr[2] = arr[1] + 2;
    arr.forEach((e, i) => {
        if (e > 7) e -= 7; // wrap back
        arr[i] = e;
    })

    /* Now we convert the scale degrees into staff indicies. Recall that each key
    includes the base staff index of its root (0 for C, 1 for D, 4 for G...). To do
    this we decrease each scale degree by one so they can be treated like 0 based 
    indices. Now consider that the staff root of a key is also the distance that 
    key is from 0. For example C has staff root 0, and is 0 away from 0. F has 
    staff root 3, and is 3 away from 0. Since the values in arr are now 0 based, we 
    can add the staff root to each to get them into the correct key. Finally, we 
    wrap any values 7 or greater back to 0 to keep things in base staff index. */
    let staffRoot = KEY_SIGNATURES.get(key).get("staff_root");
    arr.forEach((e, i) => {
        e -= 1;
        e += staffRoot;
        if (e >= 7) e -=7;
        arr[i] = e;
    })

    /* Before we can generate notes, we have to move all indices to their register
    equivalent just above min. */
    arr.forEach((e, i) => {
        if (e > min) {
            while (e >= min + 7) e -= 7;
        }
        if (e < min) {
            while (e <= min) e += 7;
        }
        arr[i] = e;
    })

    /* Now we sort the array. The reason is because our min indices are not necessarily
    in the correct chord order. Imagine we're making a one chord in C major, and our min
    staff index is 1. At this point arr is going to containt: [7, 2, 4]. Although these 
    are the correct indices, this is not the order we should start choosing options in.
    For that the order should be [2, 4, 7]. */
    arr.sort();

    /* Now we can finally generate our options. To do this we add elements from arr in 
    order, but increase the value by an octave each time, until we reach a value larger
    than max. */
    let options = [];
    let index = 0;
    while (arr[index] <= max) {
        options.push(arr[index]);
        arr[index] += 7;
        index++;
        if (index >= arr.length) index = 0;
    }

    return options;
}

class Chord { 
    constructor(key = "C", indMin = 0, indMax = 15, numOfPitches = 1, duration = 12, harmony = null) {
        this.pitches = []; // pitches are pitch objects
        /* We should elaborate on duration here. Duration is actually a multiplier
        of DEFAULT_DURATION in the abcjs file. Recall that DEFAULT_DURATION is 
        actually the denominator of our default note length in abcjs. So if our
        DEFAULT_DURATION is 48, a quarter note should have a duration of 12, an
        eighth note a duration of 6, and a whole note a duration of 48. */
        this.duration = duration; // the ABC modifier for the default length
        this.path = null; // reference to the html element of the note
        this.timingIndex = null; // index this chord exists in the timing array
        this.staffIndexLowest = null; // for determining pitch limits in multi pitch chords
        this.staffIndexHighest = null; // same as above

        // we declare our pitch options by making an array of all valid staff indices
        let options = getChordOptions(key, indMin, indMax, harmony);

        for (let i = 0; i < numOfPitches && options.length > 0; i++) {
            /* We randomly choose an index from the options array, create a pitch from it,
            add it to the chord, and remove that pitch from our options. */
            let choiceIndex = Math.floor(Math.random() * options.length)
            let choice = options[choiceIndex]
            this.addPitch(new Pitch(key, choice));
            options.splice(choiceIndex, 1);

            /* In order to prevent the music from being unplayable, we have to remove 
            pitch options that are too far away from pitches already in our chord. We've
            chosen an octave to be the maximum span of a chord. First, we'll remove all
            options that are more an than octave higher than the lowest note. */
            let remove = this.staffIndexLowest + 7;
            let index = 0;
            while (index < options.length && options[index] <= remove) index++;
            /* The index is now at the first position where the option is an invalid
            for the remainder of the array. Since splice deletes n elements, we have 
            to use the number of elements remaining in the array. */
            options.splice(index, options.length - index);

            // now we remove the low notes with the same logic
            remove = this.staffIndexHighest - 7;
            index = options.length - 1;
            while (index >= 0 && options[index] >= remove) index--;
            /* Moving backwards, the index is now at the position of the first element
            that is less than remove. Since the splice function takes a length, and not
            an end index, we need to add 1 to the index for it to work. For example, 
            let's say we need to remove the first 3 values. This means the index would 
            stopped at 2, so it must be increased to 3 for the splice to work. */
            options.splice(0, index + 1);
        }        
    }

    addPitch(pitch) {
        if (this.pitches.length === 0) {
            this.pitches.push(pitch);
            this.staffIndexLowest = pitch.staffIndex;
            this.staffIndexHighest = pitch.staffIndex;
            return;
        }

        /* In a chord with multiple pitches, pitches must be sorted from lowest
        staff index to highest staff index. */
        this.pitches.push(null);
        for (let i = 0, pitchToMove = pitch; i < this.pitches.length; i++) {
            if (this.pitches[i] === null || pitchToMove.staffIndex < this.pitches[i].staffIndex) {
                let temp = this.pitches[i];
                this.pitches[i] = pitchToMove;
                pitchToMove = temp;
            }
        }
        this.staffIndexLowest = this.pitches[0].staffIndex;
        this.staffIndexHighest = this.pitches[this.pitches.length - 1].staffIndex;
    }

    getABCString() {
        if (this.pitches.length === 0) return "x" + this.duration.toString(); // no pitches means invisible rest
        if (this.pitches.length === 1) return this.pitches[0].string + this.duration.toString();
        let result = "[";
        this.pitches.forEach(e => result += e.string);
        result += "]" + this.duration.toString();
        return result;
    }

    getIndicies() {
        let inds = "[";
        for (let i = 0; i < this.pitches.length; i++) {
            if (i === this.pitches.length - 1) inds += this.pitches[i].staffIndex;
            else inds += this.pitches[i].staffIndex + ", ";
        }
        inds += "]";
        return inds;
    }
}

let harmony = "I";
/* returns a 2D array of chord objects, each with the given duration, number of pitches, and 
pitches between the min and max (inclusive) for the respective staff. */
const generateNotes = function (key = "C",
                                useHarmony = true,
                                resetHarmony = false, // if we want to start at "I", set true
                                topMin = 0, 
                                topMax =  15, 
                                topNumOfPitches = 1, 
                                topDuration = 12,
                                botMin = -15,
                                botMax = 0,
                                botNumOfPitches = 1,
                                botDuration = 24) {

    // the chord arrays
    /* I straight up forgot how this line works! I know that it only works for 4/4 timing, and the
    5 is for 5 lines of music. Must revist and make work with other time signatures. */ 
    const arrTop = new Array(5 * 16 / (topDuration / 12));
    const arrBot = new Array(5 * 16 / (botDuration / 12));

    if (useHarmony) {
        /* Notice that the variable "harmony" is delcared outside of the function, this is so that we can
        remember what the last harmony generated was for the last function call. That way we can continue 
        our progression where we left off at the end of a page. But we can also reset it if desired. */
        if (resetHarmony) harmony = "I";

        /* By our design, chords will be generated so that if one staff has a quicker duration than the
        other, it will maintain the same chord as the slower staff until that harmony is over. For example,
        if the bottom staff is whole notes, the top staff is quarter notes, and the bottom is playing the
        "I" chord, then all 4 chords in the top staff will be "I". Since longer duration means less elements 
        in the chord array, we will generate the smaller array first. */
        if (arrTop.length < arrBot.length) {
            // generate top array first
            // "diff" determines how many of each harmony we should place in the bot staff
            let diff = topDuration / botDuration;
            for (let i = 0; i < arrTop.length; i++) {
                arrTop[i] = new Chord(key, topMin, topMax, topNumOfPitches, topDuration, harmony);
                for (let k = 0; k < diff; k++) arrBot[i * diff + k] = new Chord(key, botMin, botMax, botNumOfPitches, botDuration, harmony);
                let harmony_arr = CHORDS.get(harmony);
                harmony = harmony_arr[Math.floor(Math.random() * harmony_arr.length)];
            }
        } else {
            /* Same logic as above, but top and bot reversed. Notice that if the durations are equal, this
            is the code used, and it still works since diff will be "1". */
            let diff = botDuration / topDuration;
            for (let i = 0; i < arrBot.length; i++) {
                arrBot[i] = new Chord(key, botMin, botMax, botNumOfPitches, botDuration, harmony);
                for (let k = 0; k < diff; k++) arrTop[i * diff + k] = new Chord(key, topMin, topMax, topNumOfPitches, topDuration, harmony);
                let harmony_arr = CHORDS.get(harmony);
                harmony = harmony_arr[Math.floor(Math.random() * harmony_arr.length)];
            }
        }
    } else {
        for (let i = 0; i < arrTop.length; i++) arrTop[i] = new Chord(key, topMin, topMax, topNumOfPitches, topDuration);
        for (let i = 0; i < arrBot.length; i++) arrBot[i] = new Chord(key, botMin, botMax, botNumOfPitches, botDuration);
    }
    return [arrTop, arrBot];
}

export { generateNotes, getPitchStringFromIndex }
