import React from 'react';
import { connect } from 'react-redux';
import Tone from 'tone';
import Midi from '@tonejs/midi';
import SampleLibrary from 'libs/Tonejs-Instruments';
import { Sleep } from 'utils/timer';
import FileDropzone from 'features/fileDropzone';
import { triggerKey } from 'features/keyboard/action';

const PIANO_SYNTH_NUM = 3;

type PlayState = 'playing' | 'paused' | 'stopped';

type MidiplayerProps = {
  dispatch: (a: *) => *
}

type MidiplayerState = {
  midi: Midi,
  midiUrl: String,
  midiJson: String,
  playState: PlayState,
}

class Midiplayer extends React.Component<MidiplayerProps, MidiPlayerState> {

  state: MidiplayerState = {
    midi: null,
    midiUrl: '',
    midiJson: '',
    playState: 'stopped',
  }

  pianoSynths: any[] = [];
  noteEvents: Tone.Event[] = [];

  componentWillUnmount() {
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
    console.log("midiplayer: start play. track count: ", midi.tracks.length, "duration: ", midi.duration);

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

      this.pianoSynths.forEach(synth => synth.releaseAll());
      this.reduceSynths();

      this.noteEvents.forEach(e => e.dispose());
      Tone.Transport.cancel();

      this.setState({
        ...this.state,
        playState: 'stopped',
      });
    });
    finishEvent.start(midi.duration);
    this.noteEvents.push(finishEvent);

    Tone.Transport.start();
  }

  clickPlay = () => {
    if (!this.state.midi) 
      return;

    this.setState({
      ...this.state,
      playState: 'playing',
    });

    const loadSynthNum = this.state.midi.tracks.length - this.pianoSynths.length;
    if (loadSynthNum >= 0) {
      this.loadSynths(loadSynthNum).then(() => this.scheduleMidiPlay(this.state.midi));
    } else {
      this.scheduleMidiPlay(this.state.midi);
    }
  }

  clickResume = () => {
    this.setState({
      ...this.state, 
      playState: 'playing',
    });
  }

  clickPause = () => {
    this.setState({
      ...this.state,
      playState: 'paused',
    });
  }

  clickStopped = () => {
    this.setState({
      ...this.state,
      playState: 'stopped',
    });
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
  }

  render() {
    return (
      <div>
        <input type="text" placeholder="input midi file's url here..."
               value={this.state.midiUrl}
               onChange={this.onInputUrl} />
        <FileDropzone onDropFile={this.onDropFile}/>
        <textarea placeholder="json output..." value={this.state.midiJson} readOnly></textarea>
        <button onClick={e=>this.clickPlay()}>Play</button>
      </div>
    )
  }
}

export default connect()(Midiplayer);