import abcjs from "abcjs";
import {generateABC, generateABCOneLine, midiToABC, assignPaths, generateMidiTimingArr, abcToMidi, cursorSet, cursorAdv, cursorBck, playedCorrect} from "./abcmusic"

// this is the array where we will keep track of what notes the user is playing
const MIDI_PLAYED = [];

const playAdd = function(midi) {
	if (!MIDI_PLAYED.includes(midi)) MIDI_PLAYED.push(midi);
}

const playDel = function(midi) {
	const i = MIDI_PLAYED.indexOf(midi);
	if (i >= 0) MIDI_PLAYED.splice(i, 1);
}

const notePlayed = function(midi) {
	playAdd(midi);
	if (playedCorrect(MIDI_PLAYED)) {
		cursorAdv();
		MIDI_PLAYED.length = 0;
	}
}

const noteReleased = function(midi) {
	//console.log(`Note Off ${midiToABC(midi)}`);
	playDel(midi);
}

function add_msg_handlers(controllers) {
	for (let input of controllers) {
		input.onmidimessage = (msg) => {
			if (msg.data[0] === 144) {
				if (msg.data[2] > 0) notePlayed(msg.data[1]);
				else noteReleased(msg.data[1]);
			} 
		}
	}
	console.log("Done")
}

function onfullfilled(midiaccess, options) {
	console.log(midiaccess);
	let controllers = midiaccess.inputs.values()
	console.log(controllers);
	add_msg_handlers(controllers);
	midiaccess.onstatechange = (_) => add_msg_handlers(controllers);
}

navigator.requestMIDIAccess()
	.then(onfullfilled)
	.catch(err => console.log(err));

/* I'm going to link the documentation right here: 
https://paulrosen.github.io/abcjs/visual/render-abc-options.html
The renderAbc function accepts an object filled with options for abcjs. 
It's important to understand why we've chosen the options we have...  
if we decide to use them */
abcjs.renderAbc("abc-paper", generateABC(), {
	add_classes: true
})

/* We need to be able to refer to the html to change the color of notes. We do that
with query selectors. The generateABC function does more than create strings. It also
creates music objects that represent the music. The assign paths function gives
these objects references to their own html elements. */
const notesTop = Array.from(document.querySelectorAll("div svg path.abcjs-note.abcjs-v0"));
const notesBot = Array.from(document.querySelectorAll("div svg path.abcjs-note.abcjs-v1"));
assignPaths(notesTop, notesBot);

// the timing array is how we keep track of where the user is in the music
generateMidiTimingArr();

// set cursor at the beginning
cursorSet(0);

document.addEventListener('keydown', e => {
	if (e.code === "ArrowRight") cursorAdv();
	if (e.code === "ArrowLeft") cursorBck();
});
