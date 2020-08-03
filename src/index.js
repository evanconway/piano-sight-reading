import abcjs from "abcjs";
import {generateABC, midiToABC, testABC} from "./abcmusic"

function add_msg_handlers(controllers) {
  for (let input of controllers) {
    input.onmidimessage = (msg) => {
      if (msg.data[0] === 144 && msg.data[2] > 0) {
        console.log(`Note On ${midiToABC(msg.data[1], true)}`);
        console.log(msg.data);
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

const ABC_MUSIC = abcjs.renderAbc("abc-paper", generateABC());
console.log(ABC_MUSIC);

/* TODO
Define music object
need function to translate it to regular ABC string
midi to abc function (relative to key?)
key signature note normalization (ex: no sharp if note already sharp in key)
score manipulation functions
measure counting and insertion
line breaks
*/
