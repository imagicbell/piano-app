import { 
  type Tempo,
  type TimeSignature,
  type KeySignature,
  type Velocity,
  type Header,
  type Note,
  type Instrument,
  type Track,
  type Measure,
} from './type';
import "utils/extension";
import { notes as noteMap } from 'config/notes';

const KeySignatureKeys = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];

type RepeatEnding = {
  startMeasure: number,
  stopMeasure: number,
  backwardMeasure: number,
  number: number,
}

type RepeatMeta = {
  forwardStartMeasure: number,
  forwardEndMeasure: number,
  endings: RepeatEnding[],
}

export const parseHeader = (data: any): [Header, Measure[]] => {
  const header: Header = {
    name: '',
    tempos: [],
    timeSignatures: [],
    keySignatures: [],
    velocities: []
  };
  const measures: Measure[] = new Array(data.measures.length);

  header.name = parseHeaderName(data);
  parseHeaderInfo(data, header, measures);

  return [header, measures];
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

const parseHeaderInfo = (data: any, header: Header, measures: Measure[]): void => {
  let curTempo: Tempo;
  let curTimeSignature: TimeSignature;   
  let repeatMeta: RepeatMeta;
  //check the first part for the header data(just like the Tonejs/Midi)
  const partId = data.partList[0].id;
  let measureIndex = 0;

  while (measureIndex < data.measures.length) {
    //measure start time
    let measureTime = 0;
    if (measureIndex > 0) {
      if (!curTempo || !curTimeSignature) {
        throw new Error("Invalid MusicXml file: no tempo or time signature info provided in first measure.")
      }
      let elapsedSeconds = (60 / curTempo.bpm) * curTimeSignature.beats;
      measureTime = measures[measureIndex - 1].time + elapsedSeconds;
    }
    measures[measureIndex] = { id: measureIndex, time: measureTime }

    const infoArray = data.measures[measureIndex].parts[partId];
    for (let i = 0; i < infoArray.length; i++) {
      const info = infoArray[i];
      if (info._class === "Attributes") {
        //key signatures
        if (info.keySignatures && info.keySignatures.length > 0) {
          header.keySignatures.push(parseKeySignature(info.keySignatures[0], measureIndex, measureTime));
        }
        //time signatures
        if (info.times && info.times.length > 0) {
          curTimeSignature = parseTimeSignature(info.times[0], measureIndex, measureTime);
          header.timeSignatures.push(curTimeSignature);
        }
      } else if (info._class === "Sound" || info._class === "Direction") {
        //tempo, velocity
        let [tempo, velocity] = parseSound(info.sound ? info.sound : info, measureIndex, measureTime);
        if (tempo) {
          curTempo = tempo;
          header.tempos.push(tempo);
        }
        if (velocity) {
          header.velocities.push(velocity);
        }
      } else if (info._class === "Barline") {
        //repeat
        repeatMeta = parseRepeatMeta(info, measureIndex, repeatMeta);
        //delete after parsing, in case of redundant parse 
        infoArray.splice(i, 1);
        i--;
      }
    }

    //calculate tempo's bpm
    if (curTempo.bpm === undefined) {
      curTempo.bpm = (curTimeSignature.beatType / 4) * curTempo.tempo;
    }

    doRepeat(data.measures, repeatMeta);
    measureIndex++;
  }
}

const parseSound = (soundInfo: any, measures: number, time: number): [Tempo, Velocity] => {
  let tempo: Tempo, velocity: Velocity;
  if (soundInfo.tempo) {
    tempo = {
      tempo: parseInt(soundInfo.tempo),
      bpm: undefined,
      measures: measures,
      time: time
    }
  }
  if (soundInfo.dynamics) {
    velocity = {
      dynamics: parseFloat(soundInfo.dynamics) * 0.01,
      measures: measures,
      time: time
    }
  }
  return [tempo, velocity];
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
  };
}

const parseRepeatMeta = (repeatInfo: any, measures: number, repeatMeta: RepeatMeta): RepeatMeta => {
  repeatMeta = repeatMeta || {};

  if (repeatInfo.repeat) {
    if (repeatInfo.repeat.direction === 1) {
      repeatMeta.forwardStartMeasure = measures;
    } else {
      repeatMeta.endings[repeatMeta.endings.length - 1].backwardMeasure = measures;
    }
  }
  if (repeatInfo.ending) {
    if (repeatInfo.ending.type === 0) {
      repeatMeta.endings = repeatMeta.endings || [];
      repeatMeta.endings.push({
        startMeasure: measures,
        number: repeatInfo.ending.number,
      });
      if (repeatInfo.ending.number === 1) {
        repeatMeta.forwardEndMeasure = measures - 1;
      }
    } else {
      repeatMeta.endings[repeatMeta.endings.length - 1].stopMeasure = measures;
    }
  }

  return repeatMeta;
}

/**
 * when meet a backward measure, insert the measures from the forward measure to the measure before the first ending.
 */
const doRepeat = (measures: any[], repeatMeta: RepeatMeta) => {
  if (!repeatMeta || !repeatMeta.endings || repeatMeta.endings.length === 0) {
    return;
  }
  const ending = repeatMeta.endings[0];
  if (ending.stopMeasure === undefined) {
    return;
  }
  repeatMeta.endings.shift();
  if (ending.backwardMeasure === undefined) {
    return;
  }

  let measureIndex = ending.backwardMeasure + 1;
  for (let i = repeatMeta.forwardStartMeasure; i <= repeatMeta.forwardEndMeasure; i++) {
    measures.splice(measureIndex, 0, { ...measures[i] });
    measureIndex++;
  }
}

export const parseTracks = (data: any, header: Header, measures: Measure[]) : [Track[], number] => {
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

  parseNotes(data, header, measures, tracks);

  let lastMeasureTime = measures[measures.length - 1].time;
  let lastBpm = header.tempos[header.tempos.length - 1].bpm;
  let lastBeats = header.timeSignatures[header.timeSignatures.length - 1].beats;
  let totalDuration = lastMeasureTime + (60 / lastBpm) * lastBeats;

  return [tracks, totalDuration];
}

const parseNotes = (data: any, header: Header, measures: Measure[], tracks: Track[]): void => {
  let curDivisionTime: number;  //seconds of a division
  let curTempo: Tempo;
  let curVelocity: Velocity;
  let tieNotes: Note[][] = new Array(tracks.length).fill([]);

  data.measures.forEach((measure, measureIndex) => {
    curTempo = header.tempos.findLast(t => t.measures <= measureIndex);
    curVelocity = header.velocities.findLast(v => v.measures <= measureIndex);

    data.partList.forEach((part, partIndex) => {
      let notes = tracks[partIndex].notes;
      let curTime = measures[measureIndex].time;

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
            parseNote(info, notes, tieNotes[partIndex], curDivisionTime, curTime, curVelocity.dynamics);
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

const parseNote = (noteInfo: any, notes: Note[], tieNotes: Note[], divisionTime: number, time: number, velocity: number): void => {
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

  note.time = noteInfo.chord ? notes[notes.length - 1].time : time;
  note.duration = noteInfo.duration * divisionTime;
  note.velocity = velocity;
  
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