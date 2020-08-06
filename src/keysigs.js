const keySignatures = new Map();

const majorC = new Map();
majorC.set(0, "C");
majorC.set(1, "^C");
majorC.set(2, "D");
majorC.set(3, "^D");
majorC.set(4, "E");
majorC.set(5, "F");
majorC.set(6, "^F");
majorC.set(7, "G");
majorC.set(8, "^G");
majorC.set(9, "A");
majorC.set(10, "^A");
majorC.set(11, "B");
const minorA = new Map();
majorC.forEach((key, value) => minorA.set(key, value));
keySignatures.set("C", majorC);
keySignatures.set("Am", minorA);

const majorG = new Map();
majorG.set(0, "C");
majorG.set(1, "^C#");
majorG.set(2, "D");
majorG.set(3, "^D#");
majorG.set(4, "E");
majorG.set(5, "=F");
majorG.set(6, "F#");
majorG.set(7, "G");
majorG.set(8, "^G");
majorG.set(9, "A");
majorG.set(10, "^A");
majorG.set(11, "B");
const minorE = new Map();
majorG.forEach((key, value) => minorE.set(key, value));
keySignatures.set("C", majorG);
keySignatures.set("Am", minorE);

