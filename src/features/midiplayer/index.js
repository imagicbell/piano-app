import React from 'react';
import { connect } from 'react-redux';
import Tone from 'tone';
import ToneMidi from '@tonejs/midi';
import SampleLibrary from 'libs/Tonejs-Instruments';
import { Sleep } from 'utils/timer';
import FileDropzone from 'features/fileDropzone';
import { triggerKey } from 'features/keyboard/action';
import styles from './style.css'

const PIANO_SYNTH_NUM = 3;

type MidiNote = {
  note: any,  //note in midi file
  noteIndex: Number,
  trackIndex: Number,
}

type MidiplayerProps = {
  dispatch: (a: *) => *
}

type MidiplayerState = {
  midiUrl: String,
  midiJson: String,
  isMidiReady: Boolean,
  originBpm: Number,
  playbackRate: Number,
  playNoteIndexes: Number[],
}

class Midiplayer extends React.Component<MidiplayerProps, MidiPlayerState> {

  state: MidiplayerState = {
    midiUrl: '',
    midiJson: '',
    isMidiReady: false,
    orignBpm: 0,
    playbackRate: 1,
    playNoteIndexes: [],
  }

  midi: ToneMidi = null;
  pianoSynths: any[] = [];
  noteEvents: Tone.Event[] = [];

  frameId: Number;
  lastPlayState: String = "stopped";

  get playState() {
    return Tone.Transport.state;
  }

  get currentNotes(): MidiNote[] {
    let notes = [];
    this.state.playNoteIndexes.forEach((noteIndex, trackIndex) => {
      const note = this.midi.tracks[trackIndex].notes[noteIndex];
      if (note) {
        notes.push({ note, noteIndex, trackIndex });
      }
    });
    return notes;
  }

  get nextNotes(): MidiNote[] {
    let notes = [];
    this.state.playNoteIndexes.forEach((noteIndex, trackIndex) => {
      const note = this.midi.tracks[trackIndex].notes[noteIndex + 1];
      if (note) {
        notes.push({ note, noteIndex: noteIndex + 1, trackIndex });
      }
    });
    return notes;
  }

  get previousNotes(): MidiNote[] {
    let notes = [];
    this.state.playNoteIndexes.forEach((noteIndex, trackIndex) => {
      const note = this.midi.tracks[trackIndex].notes[noteIndex - 1];
      if (note) {
        notes.push({ note, noteIndex: noteIndex - 1, trackIndex });
      }
    });
    return notes;
  }

  componentDidMount() {
    Tone.Transport.on("stop", () => {
      this.setState({
        ...this.state,
        playNoteIndexes: this.midi.tracks.map(track => -1),  
      });
    });

    this.frameId = requestAnimationFrame(this.update);
  }

  componentWillUnmount() {
    this.cleanSchedule();

    this.pianoSynths.forEach(synth => synth.dispose());
    this.pianoSynths.length = 0;

    Tone.Transport.off("stop");

    cancelAnimationFrame(this.frameId);
  }

  update = () => {
    if (this.lastPlayState !== this.playState) {
      this.lastPlayState = this.playState;
      this.forceUpdate();
    }

    this.frameId = requestAnimationFrame(this.update);  
  }

  loadSynths = async (synthNum: Number) => {
    let count = 0;
    for (let i = 0; i < synthNum; i++) {
      const synth = SampleLibrary.load({
        instruments: "piano",
        // eslint-disable-next-line
        onload: () => {
          count++;
          console.log("midiplayer: load piano finish");
        }
      }).toMaster();
      this.pianoSynths.push(synth);
    }

    while(true) {
      await Sleep(100);
      if (count === synthNum)
        break;
    }
  }

  reduceSynths = () => {
    while (this.pianoSynths.length > PIANO_SYNTH_NUM) {
      const synth = this.pianoSynths.pop();
      synth.dispose();
    }
  }

  scheduleMidiPlay = (midi: ToneMidi) => {
    this.cleanSchedule();

    console.log("midiplayer: schedule play. track count: ", midi.tracks.length, "duration: ", midi.duration);

    Tone.Transport.bpm.value = midi.header.tempos && midi.header.tempos.length > 0 ? midi.header.tempos[0].bpm : 120;
    Tone.Transport.timeSignature = midi.header.timeSignatures[0].timeSignature;

    midi.tracks.forEach((track, trackIndex) => {
      const synth = this.pianoSynths[trackIndex];
      track.notes.forEach((note, noteIndex) => {
        const e = new Tone.Event((time) => {
          synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
          this.props.dispatch(triggerKey(note.name, note.duration));
          
          const playNoteIndexes = this.state.playNoteIndexes;
          playNoteIndexes[trackIndex] = noteIndex;
          this.setState({
            ...this.state,
            playNoteIndexes,
          });
        });
        e.start(note.time);
        this.noteEvents.push(e);
      });
    });

    const finishEvent = new Tone.Event(time => {
      console.log("midiplayer: finish play");
      Tone.Transport.emit("stop");
    });
    finishEvent.start(midi.duration);
    this.noteEvents.push(finishEvent);

    this.setState({
      ...this.state,
      isMidiReady: true,
      originBpm: Tone.Transport.bpm.value,
      playbackRate: 1,  //reset
      playNoteIndexes: midi.tracks.map(track => -1),
    });
  }

  cleanSchedule = () => {
    this.pianoSynths.forEach(synth => synth.releaseAll());
    this.reduceSynths();

    this.noteEvents.forEach(e => e.dispose());
    Tone.Transport.cancel();

    this.setState({
      ...this.state,
      isMidiReady: false,
    });
  }

  onChangeMidi = () => {
    if (!this.midi) {
      this.cleanSchedule();
    } else {
      const loadSynthNum = this.midi.tracks.length - this.pianoSynths.length;
      if (loadSynthNum >= 0) {
        this.loadSynths(loadSynthNum).then(() => this.scheduleMidiPlay(this.midi));
      } else {
        this.scheduleMidiPlay(this.midi);
      }
    }
  }

  onInputUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.midi = null;

    this.setState({
      ...this.state,
      midiUrl: e.target.value,
      midiJson: "Parsing midi file..."
    });

    ToneMidi.fromUrl(this.state.midiUrl).then(midi => {
      this.midi = midi;
      this.setState({
        ...this.state,
        midiJson: JSON.stringify(midi, undefined, 2),
      });

      this.onChangeMidi();
    });
  }

  onDropFile = (fileContent: String) => {
    this.midi = new ToneMidi(fileContent);

    this.setState({
      ...this.state,
      midiUrl: '',
      midiJson: JSON.stringify(this.midi, undefined, 2),
    });

    this.onChangeMidi();
  }

  onChangePlaybackRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const curPlaybackRate = parseFloat(e.target.value);
    Tone.Transport.bpm.value = this.state.originBpm * curPlaybackRate;

    this.setState({
      ...this.state,
      playbackRate: curPlaybackRate
    });
  }

  get playBtnText() {
    switch(this.playState) {
      case "stopped" : return "Play";
      case "started" : return "Pause";
      case "paused" : return "Resume";
      default: return "Play";
    }
  }

  clickPlayBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    switch(e.target.innerText) {
      case "Play": 
        Tone.Transport.start();
        break;

      case "Pause":
        Tone.Transport.pause();
        break;

      case "Resume":
        Tone.Transport.start();
        break;

      default:
        break;
    }
  }

  clickStopBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    Tone.Transport.stop();
    Tone.Transport.emit("stop");
  }

  clickStepForwardBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (this.playState !== "paused" && this.playState !== "stopped")
      return;

    let nextNotes = this.nextNotes;
    if (nextNotes.length === 0) 
      return;

    let timeLine = [];
    nextNotes.forEach(midiNote => {
      timeLine.push(midiNote.note.time);
      timeLine.push(midiNote.note.time + midiNote.note.duration);
    });  
    timeLine.sort((a, b) => a - b);

    //start from the nearest next note
    Tone.Transport.position = Tone.Time(timeLine[0]).toBarsBeatsSixteenths();

    //pause after the shortest gap
    let duration = 0;
    for (let i = 1; i < timeLine.length; i++) {
      const gap = timeLine[i] - timeLine[0];
        if ( gap > 0.0001) {
        duration = gap;
        break;
      }
    }

    Tone.Transport.start();
    Tone.Transport.pause(`+${duration}`); 
  }

  clickStepBackwardBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (this.playState !== "paused")
      return;
      
    let preNotes = this.previousNotes;
    if (preNotes.length === 0) 
      return;

    let timeLine = [];
    preNotes.forEach(midiNote => {
      timeLine.push({
        time: midiNote.note.time,
        pos: "begin",
      });
      timeLine.push({
        time: midiNote.note.time + midiNote.note.duration,
        pos: "end",
      });
    });
    timeLine.sort((a, b) => a.time - b.time);

    //start from the nearest previous "begin"
    let startTime = 0, endTime = 0;
    for (let i = timeLine.length - 1; i >= 0; i--) {
      if (timeLine[i].pos === "begin") {
        startTime = timeLine[i].time;
        endTime = timeLine[i + 1].time;
        break;
      }
    }
    Tone.Transport.position = Tone.Time(startTime).toBarsBeatsSixteenths();

    Tone.Transport.start();
    Tone.Transport.pause(`+${endTime - startTime}`); 
  }

  render() {
    return (
      <div>
        <input type="text" placeholder="input midi file's url here..."
               value={this.state.midiUrl}
               onChange={this.onInputUrl} />
        <FileDropzone onDropFile={this.onDropFile}/>
        <textarea className="json-area" placeholder="json output..." value={this.state.midiJson} readOnly />

        <div className="slidecontainer">
          <span>{`Tempo:  ${this.state.playbackRate}`}</span>  
          <input type="range" min="0.1" max="4" step="0.1" 
                 value={this.state.playbackRate} 
                 onChange={this.onChangePlaybackRate}/>
          <span>{`BPM:  ${Tone.Transport.bpm.value}`}</span>
        </div>

        <div className="control-btn-container">
          <button className="play-btn"
                  disabled={!this.state.isMidiReady}
                  onClick={this.clickPlayBtn}>
            {this.playBtnText}
          </button>

          <button className="stop-btn"
                  hidden={!this.state.isMidiReady}
                  onClick={this.clickStopBtn}>
            Stop
          </button>

          <button className="step-foward-btn"
                  hidden={!this.state.isMidiReady}
                  onClick={this.clickStepForwardBtn}>
            {'>>'}
          </button>

          <button className="step-backward-btn"
                  hidden={!this.state.isMidiReady}
                  onClick={this.clickStepBackwardBtn}>
            {'<<'}
          </button>
        </div>

      </div>
    )
  }
}

export default connect()(Midiplayer);