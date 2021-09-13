import React from 'react';
import { connect } from 'react-redux';
import Tone from 'tone';
import SampleLibrary from 'libs/Tonejs-Instruments';
import { Sleep } from 'utils/timer';
import { triggerKey } from 'features/keyboard/action';
import './style.scss';
import Midi from 'data/midi';
import 'utils/extension';
import { NOTE_PREVIEW_TIME } from 'config/settings';
import { EventSystem } from 'utils/EventSystem';
import { pause, resume, stop, changeSpeed } from './action';

const PIANO_SYNTH_NUM = 3;
const PLAYSTATE = {
  START: "started",
  STOP: "stopped",
  PAUSE: "paused"
}

type MidiNote = {
  note: any,  //note in midi file
  noteIndex: Number,
  trackIndex: Number,
}

type MidiplayerProps = {
  midi: Midi,
  dispatch: (a: *) => *,
}

type MidiplayerState = {
  isMidiReady: Boolean,
  originBpm: Number,
  playbackRate: Number,
  playNoteIndexes: Number[],
  playProgress: number,
}

class Midiplayer extends React.Component<MidiplayerProps, MidiPlayerState> {

  state: MidiplayerState = {
    isMidiReady: false,
    orignBpm: 0,
    playbackRate: 1,
    playNoteIndexes: [],
    playProgress: 0,
  }

  pianoSynths: any[] = [];

  frameId: Number;
  lastPlayState: String = PLAYSTATE.STOP;

  get playState() {
    return Tone.Transport.state;
  }

  get totalDuration() {
    return this.props.midi.duration;
  }

  get timeOffset() {
    return NOTE_PREVIEW_TIME;
  }
  
  get currentNotes(): MidiNote[] {
    let notes = [];
    this.state.playNoteIndexes.forEach((noteIndex, trackIndex) => {
      const note = this.props.midi.tracks[trackIndex].notes[noteIndex];
      if (note) {
        notes.push({ note, noteIndex, trackIndex });
      }
    });
    return notes;
  }

  get nextNotes(): MidiNote[] {
    let notes = [];
    this.state.playNoteIndexes.forEach((noteIndex, trackIndex) => {
      const note = this.props.midi.tracks[trackIndex].notes[noteIndex + 1];
      if (note) {
        notes.push({ note, noteIndex: noteIndex + 1, trackIndex });
      }
    });
    return notes;
  }

  get previousNotes(): MidiNote[] {
    let notes = [];
    this.state.playNoteIndexes.forEach((noteIndex, trackIndex) => {
      const note = this.props.midi.tracks[trackIndex].notes[noteIndex - 1];
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
        playNoteIndexes: this.props.midi.tracks.map(track => -1),  
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

    if (this.playState === PLAYSTATE.START) {
      this.setState({
        ...this.state,
        playProgress: (Tone.Transport.seconds / this.totalDuration * 100).toFixed(),
      });
    }

    this.frameId = requestAnimationFrame(this.update);  
  }

  componentWillReceiveProps(nextProps: MidiplayerProps) {
    if (this.props.midi !== nextProps.midi) {
      this.onChangeMidi(nextProps.midi);
    }
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

  onChangeMidi = (midi: Midi) => {
    if (this.playState !== PLAYSTATE.STOP) {
      Tone.Transport.stop();
    }
    
    if (!midi) {
      this.cleanSchedule();
    } else {
      const loadSynthNum = midi.tracks.length - this.pianoSynths.length;
      if (loadSynthNum >= 0) {
        this.loadSynths(loadSynthNum).then(() => this.scheduleMidiPlay(midi));
      } else {
        this.scheduleMidiPlay(midi);
      }
    }
  }

  scheduleMidiPlay = (midi: Midi) => {
    this.cleanSchedule();

    console.log("midiplayer: schedule play. track count: ", midi.tracks.length);

    //default to 120, in case of no tempo provided in midi file, which is unusual.
    Tone.Transport.bpm.value = 120;
    midi.header.tempos.forEach((tempo, tempoIndex) => {
      if (tempoIndex === 0) {
        Tone.Transport.bpm.value = tempo.bpm;
      } else {
        Tone.Transport.schedule(time => {
          Tone.Transport.bpm.value = tempo.bpm;
          this.setState({ ...this.state, originBpm: tempo.bpm });
        }, tempo.time + this.timeOffset);
      }
    });

    midi.header.timeSignatures.forEach((ts, tsIndex) => {
      if (tsIndex === 0) {
        Tone.Transport.timeSignature = [ts.beats, ts.beatType];
      } else {
        Tone.Transport.schedule(time => {
					Tone.Transport.timeSignature = [ts.beats, ts.beatType];
				}, ts.time + this.timeOffset);
      }
    });

    midi.tracks.forEach((track, trackIndex) => {
      const synth = this.pianoSynths[trackIndex];
      track.notes.forEach((note, noteIndex) => {
        //preview
				Tone.Transport.schedule(time => {
          Tone.Draw.schedule(() => {
            this.context.dispatch('preview_key', note.name, note.duration);
          }, time);
				}, note.time);

        //play
        Tone.Transport.schedule(time => {
          synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
          
          const playNoteIndexes = this.state.playNoteIndexes;
          playNoteIndexes[trackIndex] = noteIndex;
          this.setState({
            ...this.state,
            playNoteIndexes,
          });

					Tone.Draw.schedule(() => {
            this.props.dispatch(triggerKey(note.name, note.duration));
          }, time);
				}, note.time + this.timeOffset);
      });
    });

    Tone.Transport.schedule(time => {
			console.log("midiplayer: finish play");
			Tone.Transport.stop();
      Tone.Transport.emit("stop");
		}, midi.duration + this.timeOffset);

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
    
    Tone.Transport.cancel();

    this.setState({
      ...this.state,
      isMidiReady: false,
    });
  }

  get playBtnText() {
    switch(this.playState) {
      case PLAYSTATE.STOP : return "Play";
      case PLAYSTATE.START : return "Pause";
      case PLAYSTATE.PAUSE : return "Resume";
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
        this.props.dispatch(pause());
        break;

      case "Resume":
        Tone.Transport.start();
        this.props.dispatch(resume());
        break;

      default:
        break;
    }
  }

  clickStopBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    Tone.Transport.stop();
    Tone.Transport.emit("stop");
    this.props.dispatch(stop());
  }

  clickStepForwardBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (this.playState !== PLAYSTATE.PAUSE && this.playState !== PLAYSTATE.STOP)
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
    if (this.playState !== PLAYSTATE.PAUSE)
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

  get progressText() {
    if (!this.state.isMidiReady) {
      return '';
    }
    return Tone.Transport.seconds.secondsToTime("mm:ss") + "/" + this.totalDuration.secondsToTime("mm:ss");
  }

  onChangePlayProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseFloat(e.target.value).toFixed();
    this.setState({
      ...this.state,
      playProgress: progress
    });

    if (this.playState === PLAYSTATE.START) {
      Tone.Transport.pause();
    }
    Tone.Transport.position = Tone.Time(this.totalDuration * progress * 0.01).toBarsBeatsSixteenths();
  }

  onChangePlaybackRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const curPlaybackRate = parseFloat(e.target.value);
    Tone.Transport.bpm.value = this.state.originBpm * curPlaybackRate;

    this.setState({
      ...this.state,
      playbackRate: curPlaybackRate
    });

    this.props.dispatch(changeSpeed(curPlaybackRate));
  }

  render() {
    return (
      <div>
        <div className="control-btn-container">
          <button disabled={!this.state.isMidiReady}
                  onClick={this.clickPlayBtn}>
            {this.playBtnText}
          </button>

          <button hidden={!this.state.isMidiReady}
                  onClick={this.clickStopBtn}>
            Stop
          </button>

          <button hidden={!(this.state.isMidiReady && this.state.playbackRate === 1)}
                  onClick={this.clickStepForwardBtn}>
            {'>>'}
          </button>

          <button hidden={!(this.state.isMidiReady && this.state.playbackRate === 1)}
                  onClick={this.clickStepBackwardBtn}>
            {'<<'}
          </button>

          <p className="progress-text" hidden={!this.state.isMidiReady}>
            {this.progressText}
          </p>
        </div>

        <input className="slider-control"
               type="range" min="0" max="100"
               value={this.state.playProgress}
               onChange={this.onChangePlayProgress}
               style={{backgroundImage: `linear-gradient(to right, #0199ff ${this.state.playProgress}%, #cfcfcf, ${this.state.playProgress}%, #cfcfcf)`}} />

        <div className="tempo-container">
          <span>{`Tempo:  ${this.state.playbackRate}`}</span>  
          <input type="range" min="0.1" max="4" step="0.1" 
                 disabled={!this.state.isMidiReady}
                 value={this.state.playbackRate} 
                 onChange={this.onChangePlaybackRate} />
          <span>{`BPM:  ${Tone.Transport.bpm.value.toFixed()}`}</span>
        </div>

      </div>
    )
  }
}

Midiplayer.contextType = EventSystem;

export default connect(
  state => ({
    midi: state.musicInput.midi
  })
)(Midiplayer);