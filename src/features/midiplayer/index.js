import React from 'react';
import { connect } from 'react-redux';
import Tone from 'tone';
import Midi from '@tonejs/midi';
import SampleLibrary from 'libs/Tonejs-Instruments';
import { Sleep } from 'utils/timer';
import FileDropzone from 'features/fileDropzone';
import { triggerKey } from 'features/keyboard/action';
import styles from './style.css'

const PIANO_SYNTH_NUM = 3;

type MidiplayerProps = {
  dispatch: (a: *) => *
}

type MidiplayerState = {
  midi: Midi,
  midiUrl: String,
  midiJson: String,
  isMidiReady: Boolean,
  originBpm: Number,
  playbackRate: Number,
}

class Midiplayer extends React.Component<MidiplayerProps, MidiPlayerState> {

  state: MidiplayerState = {
    midi: null,
    midiUrl: '',
    midiJson: '',
    isMidiReady: false,
    orignBpm: 0,
    playbackRate: 1,
  }

  pianoSynths: any[] = [];
  noteEvents: Tone.Event[] = [];

  get playState() {
    return Tone.Transport.state;
  }

  componentWillUnmount() {
    this.cleanSchedule();

    this.pianoSynths.forEach(synth => synth.dispose());
    this.pianoSynths.length = 0;
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

  scheduleMidiPlay = (midi: Midi) => {
    this.cleanSchedule();

    console.log("midiplayer: schedule play. track count: ", midi.tracks.length, "duration: ", midi.duration);

    Tone.Transport.bpm.value = midi.header.tempos[0].bpm;
    Tone.Transport.timeSignature = midi.header.timeSignatures[0].timeSignature;

    midi.tracks.forEach((track, index) => {
      const synth = this.pianoSynths[index];
      //schedule all of the events
      track.notes.forEach(note => {
        const e = new Tone.Event((time) => {
          synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
          this.props.dispatch(triggerKey(note.name, note.duration));
        });
        e.start(note.time);
        this.noteEvents.push(e);
      });
    });

    const finishEvent = new Tone.Event(time => {
      console.log("midiplayer: finish play");
    });
    finishEvent.start(midi.duration);
    this.noteEvents.push(finishEvent);

    this.setState({
      ...this.state,
      isMidiReady: true,
      originBpm: Tone.Transport.bpm.value,
      playbackRate: 1,  //reset
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
    if (!this.state.midi) {
      this.cleanSchedule();
    } else {
      const loadSynthNum = this.state.midi.tracks.length - this.pianoSynths.length;
      if (loadSynthNum >= 0) {
        this.loadSynths(loadSynthNum).then(() => this.scheduleMidiPlay(this.state.midi));
      } else {
        this.scheduleMidiPlay(this.state.midi);
      }
    }
  }

  onInputUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      ...this.state,
      midiUrl: e.target.value,
      midi: null,
      midiJson: "Parsing midi file..."
    });

    Midi.fromUrl(this.state.midiUrl).then(midi => {
      this.setState({
        ...this.state,
        midi,
        midiJson: JSON.stringify(midi, undefined, 2),
      });

      this.onChangeMidi();
    });
  }

  onDropFile = (fileContent: String) => {
    const midi = new Midi(fileContent);
    this.setState({
      ...this.state,
      midiUrl: '',
      midi,
      midiJson: JSON.stringify(midi, undefined, 2),
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
    this.forceUpdate();
  }

  clickStopBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    Tone.Transport.stop();
    this.forceUpdate();
  }

  clickStepForwardBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    Tone.Transport.start();
    Tone.Transport.pause('+0:1');
  }

  clickStepBackwardBtn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    let [bar, beat] = Tone.Transport.position.split(':', 2);
    bar = parseInt(bar);
    beat = parseInt(beat);
    if (beat > 0) {
      beat--;
    } else {
      
    }
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
                  hidden={this.playState !== "paused"}
                  onClick={this.clickStepForwardBtn}>
            {'>>'}
          </button>

          <button className="step-backward-btn"
                  hidden={this.playState !== "paused"}
                  onClick={this.clickStepBackwardBtn}>
            {'<<'}
          </button>
        </div>

      </div>
    )
  }
}

export default connect()(Midiplayer);