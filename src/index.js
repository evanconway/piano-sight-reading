import abcjs from "abcjs";
import {generateABC, generateABCOneLine, midiToABC, assignPaths, generateMidiTimingArr, abcToMidi, cursorSet, cursorAdv, cursorBck} from "./abcmusic"

const pianoEX = `
T:Piano Music
M:C
L:1/4
K:A
%%staves {1 2}
V:1
[K:A clef=treble]
CDEF|GABB|CDEF|GABB|CDEF|GABB|CDEF|GABB|CDEF|GABB|CDEF|GABB|CDEF|GABB|CDEF|GABB|]
V:2
[K:A clef=bass]
C,,D,,E,,F,,|G,,A,,B,,B,,|C,,D,,E,,F,,|G,,A,,B,,B,,|C,,D,,E,,F,,|G,,A,,B,,B,,|C,,D,,E,,F,,|G,,A,,B,,B,,|C,,D,,E,,F,,|G,,A,,B,,B,,|C,,D,,E,,F,,|G,,A,,B,,B,,|C,,D,,E,,F,,|G,,A,,B,,B,,|C,,D,,E,,F,,|G,,A,,B,,B,,|]
`
const testABC = `
T:Piano Music
M:C
L:1/4
K:A
%%staves {1,2}
V:2
AAAAAAAAAAAAAAAA
V:2
K:B
M:6/8
CCCCCBBB
V:2
FFFFFFFFFFFFFFFF
V:1
BBBBBBBBBBBBBBBB
`

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

/* I'm going to link the documentation right here: 
https://paulrosen.github.io/abcjs/visual/render-abc-options.html
The renderAbc function accepts an object filled with options for abcjs. 
It's important to understand why we've chosen the options we have...  
if we decide to use them */
abcjs.renderAbc("abc-paper", generateABC(), {
  add_classes: true
})

const notesTop = Array.from(document.querySelectorAll("div svg path.abcjs-note.abcjs-v0"));
const notesBot = Array.from(document.querySelectorAll("div svg path.abcjs-note.abcjs-v1"));
assignPaths(notesTop, notesBot);
console.log("Top Note Paths");
console.log(notesTop);
console.log("Bot Note Paths");
console.log(notesBot);
console.log(generateMidiTimingArr());
cursorSet(0);
cursorAdv();

document.addEventListener('keydown', e => {
  if (e.code === "ArrowRight") cursorAdv();
  if (e.code === "ArrowLeft") cursorBck();
});

/* TODO
Define music object
need function to translate it to regular ABC string
midi to abc function (relative to key?)
key signature note normalization (ex: no sharp if note already sharp in key)
score manipulation functions
measure counting and insertion
line breaks
*/
