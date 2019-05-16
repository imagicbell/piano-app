import React from 'react';
import Midi from '@tonejs/midi';
import SampleLibrary from 'libs/Tonejs-Instruments';
import Tone from 'tone';
import FileDropzone from 'features/fileDropzone';

type MidiplayerProps = {
}

type MidiplayerState = {
  midiUrl: String,
  midiContent: String,
}

class Midiplayer extends React.Component<MidiplayerProps, MidiPlayerState> {

  state: MidiplayerState = {
    midiUrl: '',
    midiContent: '',
  }

  playMidi = (midi: Midi) => {
    const now = Tone.now() + 0.5;
    let synths = [];

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
            synth.triggerAttackRelease(note.name, note.duration, note.time + now, note.velocity)
          })
        }
      }).toMaster();
      synths.push(synth);
    })

    console.log(midi.duration);
    setTimeout(() => {
      synths.forEach(synth => synth.dispose());
      synths.length = 0;
      console.log("midiplayer: release synths: ", synths);
    }, (now+midi.duration)*1000);
  }

  onInputUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      midiUrl: e.target.value,
      midiContent: '',
    });
  }

  onDropFile = (fileContent: String) => {
    console.log(fileContent);
    this.setState({
      midiUrl: '',
      midiContent: fileContent      
    });
  }

  clickPlay = () => {
    if (this.state.midiUrl) {
      Midi.fromUrl(this.state.midiUrl).then(this.playMidi);
    } else if (this.state.midiContent) {
      this.playMidi(new Midi(this.state.midiContent));
    } else {
      console.log("midiplayer: no midi to play!")
    }
  }

  render() {
    return (
      <div>
        <input type="text" placeholder="input midi file's url here..."
               value={this.state.midiUrl}
               onChange={this.onInputUrl} />
        <FileDropzone onDropFile={this.onDropFile}/>

        <button onClick={e=>this.clickPlay()}>Play</button>
        
      </div>
    )
  }
}

export default Midiplayer;