import React from 'react';
import { connect } from 'react-redux';
import Midi from '@tonejs/midi';
import SampleLibrary from 'libs/Tonejs-Instruments';
import Tone from 'tone';
import FileDropzone from 'features/fileDropzone';
import { triggerKey } from 'features/keyboard/action'

type MidiplayerProps = {
  dispatch: (a: *) => *
}

type MidiplayerState = {
  midi: Midi,
  midiUrl: String,
  midiJson: String,
}

class Midiplayer extends React.Component<MidiplayerProps, MidiPlayerState> {

  state: MidiplayerState = {
    midi: null,
    midiUrl: '',
    midiJson: ''
  }

  onInputUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
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
      midiUrl: '',
      midi,
      midiJson: JSON.stringify(midi, undefined, 2),
    });
  }

  clickPlay = () => {
    if (!this.state.midi) 
      return;

    const midi = this.state.midi;
    const now = Tone.now() + 0.5;
    let synths = [];

    console.log("midi track count: ", midi.tracks.length, "duration: ", midi.duration);

    midi.tracks.forEach(track => {
      // const synth = new Tone.PolySynth(10, Tone.Synth, {
      //   envelope : {
      //     attack : 0.02,
      //     decay : 0.1,
      //     sustain : 0.3,
      //     release : 1
      //   }
      // }).toMaster()
      // synths.push(synth)
      // //schedule all of the events
      // track.notes.forEach(note => {
      //   synth.triggerAttackRelease(note.name, note.duration, note.time + now, note.velocity)
      // })

      const synth = SampleLibrary.load({
        instruments: "piano",
        onload: () => {
          console.log("midiplayer: load piano finish for midi track: ", track.name);

          //schedule all of the events
          track.notes.forEach(note => {
            const delay = note.time + now;
            synth.triggerAttackRelease(note.name, note.duration, delay, note.velocity);
            setTimeout(() => {
              this.props.dispatch(triggerKey(note.name, note.duration));
            }, delay * 1000);
          })
        }
      }).toMaster();
      synths.push(synth);
    })

    setTimeout(() => {
      synths.forEach(synth => synth.dispose());
      synths.length = 0;
      console.log("midiplayer: release synths: ", synths);
    }, (now+midi.duration)*1000);
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