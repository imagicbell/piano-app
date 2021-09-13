export const noteBaseUrl = '/res/samples/'

export type NoteType = {
  midi: number,
  ansi: string,
  type: string,
}

export const notes : NoteType[] = [
  {midi: 21, ansi: 'A0', type: 'white'},
  {midi: 22, ansi: 'A#0', type: 'black'},
  {midi: 23, ansi: 'B0', type: 'white'},
  {midi: 24, ansi: 'C1', type: 'white'},
  {midi: 25, ansi: 'C#1', type: 'black'},
  {midi: 26, ansi: 'D1', type: 'white'},
  {midi: 27, ansi: 'D#1', type: 'black'},
  {midi: 28, ansi: 'E1', type: 'white'},
  {midi: 29, ansi: 'F1', type: 'white'},
  {midi: 30, ansi: 'F#1', type: 'black'},
  {midi: 31, ansi: 'G1', type: 'white'},
  {midi: 32, ansi: 'G#1', type: 'black'},
  {midi: 33, ansi: 'A1', type: 'white'},
  {midi: 34, ansi: 'A#1', type: 'black'},
  {midi: 35, ansi: 'B1', type: 'white'},
  {midi: 36, ansi: 'C2', type: 'white'},
  {midi: 37, ansi: 'C#2', type: 'black'},
  {midi: 38, ansi: 'D2', type: 'white'},
  {midi: 39, ansi: 'D#2', type: 'black'},
  {midi: 40, ansi: 'E2', type: 'white'},
  {midi: 41, ansi: 'F2', type: 'white'},
  {midi: 42, ansi: 'F#2', type: 'black'},
  {midi: 43, ansi: 'G2', type: 'white'},
  {midi: 44, ansi: 'G#2', type: 'black'},
  {midi: 45, ansi: 'A2', type: 'white'},
  {midi: 46, ansi: 'A#2', type: 'black'},
  {midi: 47, ansi: 'B2', type: 'white'},
  {midi: 48, ansi: 'C3', type: 'white'},
  {midi: 49, ansi: 'C#3', type: 'black'},
  {midi: 50, ansi: 'D3', type: 'white'},
  {midi: 51, ansi: 'D#3', type: 'black'},
  {midi: 52, ansi: 'E3', type: 'white'},
  {midi: 53, ansi: 'F3', type: 'white'},
  {midi: 54, ansi: 'F#3', type: 'black'},
  {midi: 55, ansi: 'G3', type: 'white'},
  {midi: 56, ansi: 'G#3', type: 'black'},
  {midi: 57, ansi: 'A3', type: 'white'},
  {midi: 58, ansi: 'A#3', type: 'black'},
  {midi: 59, ansi: 'B3', type: 'white'},
  {midi: 60, ansi: 'C4', type: 'white'},
  {midi: 61, ansi: 'C#4', type: 'black'},
  {midi: 62, ansi: 'D4', type: 'white'},
  {midi: 63, ansi: 'D#4', type: 'black'},
  {midi: 64, ansi: 'E4', type: 'white'},
  {midi: 65, ansi: 'F4', type: 'white'},
  {midi: 66, ansi: 'F#4', type: 'black'},
  {midi: 67, ansi: 'G4', type: 'white'},
  {midi: 68, ansi: 'G#4', type: 'black'},
  {midi: 69, ansi: 'A4', type: 'white'},
  {midi: 70, ansi: 'A#4', type: 'black'},
  {midi: 71, ansi: 'B4', type: 'white'},
  {midi: 72, ansi: 'C5', type: 'white'},
  {midi: 73, ansi: 'C#5', type: 'black'},
  {midi: 74, ansi: 'D5', type: 'white'},
  {midi: 75, ansi: 'D#5', type: 'black'},
  {midi: 76, ansi: 'E5', type: 'white'},
  {midi: 77, ansi: 'F5', type: 'white'},
  {midi: 78, ansi: 'F#5', type: 'black'},
  {midi: 79, ansi: 'G5', type: 'white'},
  {midi: 80, ansi: 'G#5', type: 'black'},
  {midi: 81, ansi: 'A5', type: 'white'},
  {midi: 82, ansi: 'A#5', type: 'black'},
  {midi: 83, ansi: 'B5', type: 'white'},
  {midi: 84, ansi: 'C6', type: 'white'},
  {midi: 85, ansi: 'C#6', type: 'black'},
  {midi: 86, ansi: 'D6', type: 'white'},
  {midi: 87, ansi: 'D#6', type: 'black'},
  {midi: 88, ansi: 'E6', type: 'white'},
  {midi: 89, ansi: 'F6', type: 'white'},
  {midi: 90, ansi: 'F#6', type: 'black'},
  {midi: 91, ansi: 'G6', type: 'white'},
  {midi: 92, ansi: 'G#6', type: 'black'},
  {midi: 93, ansi: 'A6', type: 'white'},
  {midi: 94, ansi: 'A#6', type: 'black'},
  {midi: 95, ansi: 'B6', type: 'white'},
  {midi: 96, ansi: 'C7', type: 'white'},
  
  {midi: 97, ansi: 'C#7', type: 'black'},
  {midi: 98, ansi: 'D7', type: 'white'},
  {midi: 99, ansi: 'D#7', type: 'black'},
  {midi: 100, ansi: 'E7', type: 'white'},
  {midi: 101, ansi: 'F7', type: 'white'},
  {midi: 102, ansi: 'F#7', type: 'black'},
  {midi: 103, ansi: 'G7', type: 'white'},
  {midi: 104, ansi: 'G#7', type: 'black'},
  {midi: 105, ansi: 'A7', type: 'white'},
  {midi: 106, ansi: 'A#7', type: 'black'},
  {midi: 107, ansi: 'B7', type: 'white'},
  {midi: 108, ansi: 'C8', type: 'white'},
]

export function CalcNotePositions() {
  let whiteKeys = notes.filter(note => note.type === 'white');
  let whiteWidth = 100 / whiteKeys.length;
  let blackWidth = whiteWidth * 2/3;

  let whiteLeft = 0;
  let blackLeft = whiteWidth * 2/3;
  
  let leftPositions = notes.map((note, index) => {
    if (index > 1) {
      if (note.type === 'white') {
        whiteLeft += whiteWidth;
      } else {
        blackLeft += whiteWidth;
        if (note.ansi[0] === 'C' || note.ansi[0] === 'F') {
          blackLeft += whiteWidth; 
        }
      }
    }
    return { ansi: note.ansi, left: note.type === 'white' ? whiteLeft : blackLeft };
  });

  return {
    whiteWidth,
    blackWidth,
    leftPositions,
  }
}