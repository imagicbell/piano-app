import { 
  type Tempo,
  type TimeSignature,
  type KeySignature,
  type Header,
  type Note,
  type Instrument,
  type Track,
} from './type';
import "utils/extension";
import { notes as noteMap } from 'config/notes';

const KeySignatureKeys = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];

export const parseHeader = (data: any): [Header, number[]] => {
  const header: Header = {
    name: '',
    tempos: [],
    timeSignatures: [],
    keySignatures: []
  };
  const measureTimes: number[] = new Array(data.measures.length);

  header.name = parseHeaderName(data);
  parseHeaderInfo(data, header.tempos, header.timeSignatures, header.keySignatures, measureTimes);

  return [header, measureTimes];
}

const parseHeaderName = (data: any): string => {
  if (data.movementTitle) {
    return data.movementTitle;
  } 
  if (data.work && data.work.workTitle) {
    return data.work.workTitle;
  }
  if (data.credits && data.credits[0] && 
      data.credits[0].creditWords && data.credits[0].creditWords[0] &&
      data.credits[0].creditWords[0].words) {
    return data.credits[0].creditWords[0].words;
  }
  return '';
}

const parseHeaderInfo = (data: any, 
                         tempos: Tempo[], timeSignatures: TimeSignature[], keySignatures: KeySignature[],
                         measureTimes: number[]): void => {
  let curTempo;
  let curTimeSignature;   
  //check the first part for the header data(just like the Tonejs/Midi)
  const partId = data.partList[0].id;
  
  data.measures.forEach((measure, measureIndex) => {
    if (measureIndex === 0) {
      measureTimes[measureIndex] = 0;
    } else {
      if (!curTempo || !curTimeSignature) {
        throw new Error("Invalid MusicXml file: no tempo or time signature info provided in first measure.")
      }
      let elapsedSeconds = (60 / curTempo.bpm) * curTimeSignature.beats;
      measureTimes[measureIndex] = measureTimes[measureIndex - 1] + elapsedSeconds;
    }

    measure.parts[partId].forEach(info => {
      if (info._class === "Attributes") {
        //key signatures
        if (info.keySignatures && info.keySignatures.length > 0) {
          keySignatures.push(parseKeySignature(info.keySignatures[0], measureIndex, measureTimes[measureIndex]));
        }
        //time signatures
        if (info.times && info.times.length > 0) {
          curTimeSignature = parseTimeSignature(info.times[0], measureIndex, measureTimes[measureIndex]);
          timeSignatures.push(curTimeSignature);
        }
      } else if (info._class === "Sound") {
        if (info.tempo) {
          //tempo
          curTempo = parseTempo(info, measureIndex, measureTimes[measureIndex]);
          tempos.push(curTempo);
        }
      } else if (info._class === "Direction") {
        if (info.sound && info.sound.tempo) {
          //tempo
          curTempo = parseTempo(info.sound, measureIndex, measureTimes[measureIndex]);
          tempos.push(curTempo);
        }
      }
    });

    //calculate tempo's bpm
    if (curTempo.bpm === undefined) {
      curTempo.bpm = (curTimeSignature.beatType / 4) * curTempo.tempo;
    }
  });
}

const parseTempo = (soundInfo: any, measures: number, time: number): Tempo => {
  return {
    tempo: parseInt(soundInfo.tempo),
    bpm: undefined,
    measures: measures,
    time: time
  };
}

const parseTimeSignature = (tsInfo: any, measures: number, time: number): TimeSignature => {
  return {
    beats: parseInt(tsInfo.beats[0]),
    beatType: tsInfo.beatTypes[0],
    measures: measures,
    time: time
  }
}

const parseKeySignature = (ksInfo: any, measures: number, time: number): KeySignature => {
  return {
    key: KeySignatureKeys[ksInfo.fifths + 7],
    scale: ksInfo.mode ? ksInfo.mode : "major",
    measures: measures,
    time: time
  }
}

export const parseTracks = (data: any, header: Header, measureTimes: number[]) : [Track[], number] => {
  let tracks: Track[] = new Array(data.partList.length);

  data.partList.forEach((part, partIndex) => {
    tracks[partIndex] = {
      name: part.partName.partName,
      notes: [],
      instrument: {
        number: part.midiInstruments[0].midiProgram,
        name: part.scoreInstruments[0].instrumentName,
      }
    };
  });

  parseNotes(data, header, measureTimes, tracks);

  let lastMeasureTime = measureTimes[measureTimes.length - 1];
  let lastBpm = header.tempos[header.tempos.length - 1].bpm;
  let lastBeats = header.timeSignatures[header.timeSignatures.length - 1].beats;
  let totalDuration = lastMeasureTime + (60 / lastBpm) * lastBeats;

  return [tracks, totalDuration];
}

const parseNotes = (data: any, header: Header, measureTimes: number[], tracks: Track[]): void => {
  let curDivisionTime: number;  //seconds of a division
  let curTempo: Tempo;
  let tieNotes: Note[][] = new Array(tracks.length).fill([]);

  data.measures.forEach((measure, measureIndex) => {
    curTempo = header.tempos.findLast(t => t.measures <= measureIndex);

    data.partList.forEach((part, partIndex) => {
      let notes = tracks[partIndex].notes;
      let curTime = measureTimes[measureIndex];

      measure.parts[part.id].forEach(info => {
        switch(info._class) {
          case "Attributes": {
            //get time for one division
            if (partIndex === 0 && info.divisions) {
              curDivisionTime = 60 / curTempo.tempo / info.divisions;
            }
            break;
          }
          case "Backup": {
            curTime -= info.duration * curDivisionTime;
            break;
          }
          case "Forward": {
            curTime += info.duration * curDivisionTime;
            break;
          }
          case "Note": {
            parseNote(info, notes, curDivisionTime, tieNotes[partIndex], curTime);
            //move time forward except "chord"
            if (info.chord === undefined) {
              curTime += info.duration * curDivisionTime;
            }
            break;
          }
          default: break;
        }
      });
    });
  });
}

const parseNote = (noteInfo: any, notes: Note[], divisionTime: number, tieNotes: Note[], curTime: number): void => {
  if (!noteInfo.pitch) {
    return;
  }

  let note: Note;
  if (noteInfo.ties) {
    if (noteInfo.ties[0].type === 0) {
      //start
      note = {};
      tieNotes.push(note);
    } else {
      //stop
      note = tieNotes.shift();
      note.duration += noteInfo.duration * divisionTime;
      if (noteInfo.ties.length === 2) {
        //have another start
        tieNotes.push(note);
      }
      return;
    }
  } else {
    note = {};
  }

  note.time = noteInfo.chord ? notes[notes.length - 1].time : curTime;
  note.duration = noteInfo.duration * divisionTime;
  
  let noteName: string = noteInfo.pitch.step.toUpperCase() + noteInfo.pitch.octave;
  if (noteInfo.pitch.alter) {
    let noteMapId = noteMap.findIndex(n => n.ansi === noteName);
    noteMapId += noteInfo.pitch.alter;
    note.midi = noteMap[noteMapId].midi;
    note.name = noteMap[noteMapId].ansi;
  } else {
    note.name = noteName;
    note.midi = noteMap.find(n => n.ansi === noteName).midi;
  }

  notes.push(note);
}