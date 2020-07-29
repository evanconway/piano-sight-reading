import Vex from 'vexflow';
import abcjs from "abcjs";
import {generateABC, midiToABC, testABC} from "./abcmusic"

function midiIntToNote(i) {
  let val = i % 12;
  let note = ""
  switch (val) {
    case 0:
      note = "C";
      break;
    case 1:
      note = "C#";
      break;
    case 2:
      note = "D";
      break;
    case 3:
      note = "D#";
      break;
    case 4:
      note = "E";
      break;
    case 5:
      note = "F";
      break;
    case 6:
      note = "F#";
      break;
    case 7:
      note = "G";
      break;
    case 8:
      note = "G#";
      break; 
    case 9:
      note = "A";
      break;
    case 10:
      note = "A#";
      break;
    case 11:
      note = "B";
      break;
  }
  return note + "4/w";
}

function add_msg_handlers(controllers) {
  for (let input of controllers) {
    input.onmidimessage = (msg) => {
      if (msg.data[0] === 144 && msg.data[2] > 0) {
        console.log(`Note On ${midiToABC(msg.data[1], true)}`);
        console.log(msg.data);
          //draw_note(midiIntToNote(msg.data[1]));
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

const VF = Vex.Flow;

function draw_note(note) {

  // Create a VexFlow renderer attaced to the DIV element "boo"
  var vf = new VF.Factory({renderer: {elementId: 'thing'}});
  console.log(`Note in draw_note: ${note}`)
  var score = vf.EasyScore();
  var system = vf.System();

  // Create a 4/4 treble stave, and add two parallel voices
  system.addStave({
    voices: [
      // Top voice has 4 quarter notes with stems up
      score.voice(score.notes(note)),
    ]
  }).addClef('treble').addTimeSignature('4/4');

  // Draw it!
  vf.draw();
}

abcjs.renderAbc("abc-paper", generateABC());

/* TODO
Define music object
need function to translate it to regular ABC string
midi to abc function (relative to key?)
key signature note normalization (ex: no sharp if note already sharp in key)
score manipulation functions
measure counting and insertion
line breaks
*/

// const music = `X:8588
// T:Sample tune - abcm2ps (sample3.abc) - Staff break multi-staves
// F:http://richardrobinson.tunebook.org.uk/tune/6561
// L:1/8
// M:none
// K:G
// %%staves {1 2}
// V:1
// [K:G ^F ^F, clef=C]
// V:2 clef=F
// V:1
// [K:G clef=treble][M:C]SDE FG|AG !alcoda!FEO|DE FES||\
// V:2
// [K:G clef=bass][M:C]D,4|A,4|D,4||\
// V:1
// [K:G clef=treble]OC2D2||
// V:2
// [K:G clef=bass]A,,2D,,2||`;