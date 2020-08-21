import "./styles.css";
import { cursorAdv, cursorBck, playedCorrect, playedWrong, getCorrectMidi, makeMusic} from "./abcmusic"

// this is the array where we will keep track of what notes the user is playing
const MIDI_PLAYED = [];

document.addEventListener('keydown', e => {
	if (e.code === "ArrowRight") cursorAdv();
	if (e.code === "ArrowLeft") cursorBck();
});

const playAdd = function(midi) {
	if (!MIDI_PLAYED.includes(midi)) MIDI_PLAYED.push(midi);
}

const playDel = function(midi) {
	const i = MIDI_PLAYED.indexOf(midi);
	if (i >= 0) MIDI_PLAYED.splice(i, 1);
}

let notesWrong = false; // marked true when wrong notes played
const notePlayed = function(midi) {
	playAdd(midi);
	console.log("You played: " + MIDI_PLAYED);
	console.log("Correct is: " + getCorrectMidi());
	if (playedCorrect(MIDI_PLAYED)) {
		console.log("Correct!");
		notesWrong = false;
		let adv = cursorAdv();
		if (!adv) makeMusic(false);
		MIDI_PLAYED.length = 0;
	} else {
		// Color the cursor red, but give user 100ms of time to get it right.
		notesWrong = true;
		setTimeout(() => {
			if (notesWrong) playedWrong();
		}, 100)
	}
}

function add_msg_handlers(controllers) {
	for (let input of controllers) {
		input.onmidimessage = (msg) => {
			if (msg.data[0] === 144) {
				if (msg.data[2] > 0) notePlayed(msg.data[1]);
				else playDel(msg.data[1]);
			} 
		}
	}
}

function onfullfilled(midiaccess) {
	let controllers = midiaccess.inputs.values()
	add_msg_handlers(controllers);
	midiaccess.onstatechange = () => add_msg_handlers(controllers);
}

function onFail(err) {
	console.log(err);
	document.querySelector(".score").innerHTML = `<h1>No Midi Access!</h1>
						<p>It looks like this browser supports the Web Midi api, but no midi connection could be made!
						Please check that your device is connected properly and refresh the page.
						</p>`

}

try {
	navigator.requestMIDIAccess()
		.then(onfullfilled)
		.catch(onFail);
} catch (err) {
	console.log(err);
	document.querySelector(".warning").innerHTML = `<h1>This Browser Is Not Supported :(</h1>
													<p>Oh no! It looks like this browser doesn't support the Web Midi api. Please try using google 
														chrome or another browser that supports the Web Midi api.
													</p>`
}

makeMusic();
