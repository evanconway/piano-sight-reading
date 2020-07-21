import Vex from 'vexflow';
const VF = Vex.Flow;

// Create a VexFlow renderer attaced to the DIV element "boo"
var vf = new VF.Factory({renderer: {elementId: 'thing'}});
console.log(vf)
var score = vf.EasyScore();
var system = vf.System();

// Create a 4/4 treble stave, and add two parallel voices
system.addStave({
  voices: [
    // Top voice has 4 quarter notes with stems up
    score.voice(score.notes('C#5/q, B4, A4, G#4', {stem: 'up'})),
   
    // Bottom voice has two half notes, with the stem down
    score.voice(score.notes('C#4/h, C#4', {stem: 'down'}))
  ]
}).addClef('treble').addTimeSignature('4/4');

// Draw it!
vf.draw();
