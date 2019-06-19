//@flow
import ToneMidi from '@tonejs/midi';
import MusicXML from './musicxml';
import { notes as noteMap } from 'config/notes';
import "utils/extension"

const KeySignatureKeys = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];

export type Tempo = {
  bpm: number,  //beats per minute
  tempo?: number, //quarter notes per minute
  time?: number,
  measures?: number,
}

export type TimeSignature = {
  beats: number,
  beatType: number,
  time?: number,
  measures?: number,
}

export type KeySignature = {
  key: string,
  scale: string,
  time?: number,
  measures?: number,
}

export type Header = {
  name: string;
	tempos: Tempo[];
	timeSignatures: TimeSignature[];
	keySignatures: KeySignature[];
}

export type Note = {
  midi: number;
	name: string;
  time: number;
  duration: number;
  velocity?: number;
}

export type Instrument = {
  number: number,
  name: string,
}

export type Track = {
  name: string;
	notes: Note[];
	instrument: Instrument;
}

export default class Midi {
  header: Header;
  tracks: Track[];
  duration: number;

  /**
   * Load a MusicXML file
   * @param content is either the url of a file, or the string content of a .xml/.mxl file
   */
  loadMusicXml = async (content: string) => {
    let data = await MusicXML.Load(content);

    let measureTimes: number[];
    [this.header, measureTimes] = this._parseHeader(data);
    this.tracks = this._parseTrack(data, this.header, measureTimes);

    this.duration = 0;
    this.tracks.forEach(track => {
      const lastNote = track.notes[track.notes.length - 1];
      this.duration = Math.max(this.duration, lastNote.time + lastNote.duration);
    });

    console.log("parse musicxml header\n", this.header);
    console.log("parse musicxml tracks\n", this.tracks);
  }

  _parseHeader = (data: any) : [Header, number[]] => {
    let header: Header = {
      name: '',
      tempos: [],
      timeSignatures: [],
      keySignatures: []
    };

    //name
    if (data.movementTitle) {
      header.name = data.movementTitle;
    } else if (data.work && data.work.workTitle) {
      header.name = data.work.workTitle;
    } else if (data.credits && data.credits[0] && 
        data.credits[0].creditWords && data.credits[0].creditWords[0] &&
        data.credits[0].creditWords[0].words) {
      header.name = data.credits[0].creditWords[0].words;
    }

    let measureTimes: number[] = new Array(data.measures.length);
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
            let ks = info.keySignatures[0];
            header.keySignatures.push({
              key: KeySignatureKeys[ks.fifths + 7],
              scale: ks.mode ? ks.mode : "major",
              measures: measureIndex,
              time: measureTimes[measureIndex],
            });
          }

          //time signatures
          if (info.times && info.times.length > 0) {
            let t = info.times[0];
            header.timeSignatures.push({
              beats: parseInt(t.beats[0]),
              beatType: t.beatTypes[0],
              measures: measureIndex,
              time: measureTimes[measureIndex],
            });
          }
        } else if (info._class === "Sound") {
          if (info.tempo) {
            //tempo
            header.tempos.push({
              tempo: parseInt(info.tempo),
              measures: measureIndex,
              time: measureTimes[measureIndex],
            });
          }
        } else if (info._class === "Direction") {
          if (info.sound && info.sound.tempo) {
            //tempo
            header.tempos.push({
              tempo: parseInt(info.sound.tempo),
              measures: measureIndex,
              time: measureTimes[measureIndex],
            });
          }
        }
      });

      curTempo = header.tempos[header.tempos.length - 1];
      curTimeSignature = header.timeSignatures[header.timeSignatures.length - 1];

      //calculate tempo's bpm
      if (curTempo.bpm === undefined) {
        curTempo.bpm = (curTimeSignature.beatType / 4) * curTempo.tempo;
      }
    });

    return [header, measureTimes];
  }

  _parseTrack = (data: any, header: Header, measureTimes: number[]) : Track[] => {
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

    let curDivisionTime: number;  //seconds of a division
    let curTempo: Tempo;
    let tieNotes: Note[][] = new Array(tracks.length);

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
              if (info.pitch) {
                let note: Note;
                let isNewNote = true;
                if (info.ties) {
                  if (info.ties[0].type === 0) {
                    //start
                    note = {};
                    tieNotes[partIndex] = tieNotes[partIndex] || [];
                    tieNotes[partIndex].push(note);
                  } else if (info.ties[0].type === 1) {
                    //stop
                    isNewNote = false;
                    note = tieNotes[partIndex].shift();
                    note.duration += info.duration * curDivisionTime;
                    if (info.ties.length === 2) {
                      //have another start
                      tieNotes[partIndex].push(note);
                    }
                  }
                } else {
                  note = {};
                }
                
                if (isNewNote) {
                  note.time = info.chord ? notes[notes.length - 1].time : curTime;
                  note.duration = info.duration * curDivisionTime;
                  
                  let noteName: string = info.pitch.step.toUpperCase() + info.pitch.octave;
                  if (info.pitch.alter) {
                    let noteMapId = noteMap.findIndex(n => n.ansi === noteName);
                    noteMapId += info.pitch.alter;
                    note.midi = noteMap[noteMapId].midi;
                    note.name = noteMap[noteMapId].ansi;
                  } else {
                    note.name = noteName;
                    note.midi = noteMap.find(n => n.ansi === noteName).midi;
                  }

                  notes.push(note);
                }
              }

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

    return tracks;
  }

  /**
   * Load a Midi file
   * @param content is either the url of a file, or the string/ArrayBuffer content of a .mid file
   */
  loadMidi = async (content: string | ArrayBuffer) => {
    let toneMidi: ToneMidi;
    if (typeof content === "string" && content.endsWith(".mid")) {
      toneMidi = await ToneMidi.fromUrl(content);
    } else {
      toneMidi = new ToneMidi(content);
    }
    
    //todo: Convert the Tonejs/Midi data structure to our's
  }
}