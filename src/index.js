import "./styles.css";
import { cursorAdv, cursorBck, playedCorrect, makeMusic} from "./abcmusic"

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
		let adv = cursorAdv();
		if (!adv) makeMusic();
		MIDI_PLAYED.length = 0;
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

function onfullfilled(midiaccess, options) {
	let controllers = midiaccess.inputs.values()
	add_msg_handlers(controllers);
	midiaccess.onstatechange = () => add_msg_handlers(controllers);
}

navigator.requestMIDIAccess()
	.then(onfullfilled)
	.catch(err => console.log(err));

document.addEventListener('keydown', e => {
	if (e.code === "ArrowRight") cursorAdv();
	if (e.code === "ArrowLeft") cursorBck();
});

document.querySelector("select").addEventListener("change", e => {
	makeMusic(e.target.value)
})

makeMusic();
