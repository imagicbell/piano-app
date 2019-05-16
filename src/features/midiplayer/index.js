import React from 'react';
import Midi from '@tonejs/midi';
import SampleLibrary from 'libs/Tonejs-Instruments';
import Tone from 'tone';
import FileDropzone from 'features/fileDropzone';

class Midiplayer extends React.Component {

  clickPlay = () => {
    this.midi = Midi.fromUrl("/res/midi/supermario.mid").then(midi => {
      const now = Tone.now() + 0.5;

      midi.tracks.forEach(track => {
        //create a synth for each track
        const synth = SampleLibrary.load({
          instruments: "piano",
          onload: () => {
            console.log("load piano finish!!!");

            //schedule all of the events
            track.notes.forEach(note => {
              synth.triggerAttackRelease(note.name, note.duration, note.time + now, note.velocity)
            })
          }
        }).toMaster();
      })
    })
  }

  render() {
    return (
      <div>
        <button onClick={e=>this.clickPlay()}>Play</button>
        <FileDropzone />
      </div>
    )
  }
}

export default Midiplayer;