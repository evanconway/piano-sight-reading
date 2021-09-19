Live Link: https://aceofheart5.github.io/piano-sight-reading/

# What is this?
This is a sight-reading app designed for the piano. It generates music according to user-set options, and reads input from a midi device. 

# Installation
The app is already deployed at the live link above. If you'd like to build it yourself, clone/download the project files to your machine. Run npm install to download all node dependencies, and then npm start to run a dev version of the project on your machine.

# Why use this app?
One of the most important parts of learning sight-reading is finding music to read that's exactly the right difficulty level. If it's too easy your skills won't be challenged. But if it's too hard you won't be able to play at a musical speed and you won't have any fun. At the same time, one of the most difficult parts of learning sight reading is finding enough material to practice with. Once you've read something once, you can't use it again because then you're not sight reading. This app solves that problem! It randomly generates an infinite amount of music according to your needs.

# Requirements
You will need a MIDI device hooked up to your computer, and Chrome. This app reads MIDI input, so without a MIDI device hooked up, the app has no way of knowing what you're playing. This app uses the WebMIDI api to read input, which unfortunately is not supported by all browsers. I recommend using Chrome.

# How To Use
Use the settings on the left side of the screen to customize the music to your needs. Once you've made your choices and confirmed your MIDI device is setup, play the notes highlighted by the green cursor. The cursor will only advance if you play the correct notes. If you play incorrect notes, the cursor will turn red. Once you reach the end of the page, the app will automatically generate a new page of music with the cursor at the start. 

Happy learning!
