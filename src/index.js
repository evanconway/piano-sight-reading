import Vex from 'vexflow';
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
      switch(msg.data[0]) {
        case 144: // note on
          console.log(`Note On ${midiIntToNote(msg.data[1])}`);
          console.log(msg.data);
          draw_note(midiIntToNote(msg.data[1]));
          break;
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

function onerror(midiaccess) {
  console.log("There was an error.")
}

navigator.requestMIDIAccess().then(onfullfilled, onerror);

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
