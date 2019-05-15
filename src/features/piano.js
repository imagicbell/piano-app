//@flow
import React from 'react';
import SampleLibrary from 'libs/Tonejs-Instruments';
import Keyboard from 'features/keyboard';

class Piano extends React.Component {
  piano: any;  

  componentDidMount() {
    this.piano = SampleLibrary.load({
      instruments: "piano",
      onload: () => {
        console.log("load piano finish!!!");
      }
    }).toMaster();
  }

  playNote = (note: string) => {
    console.log('play note: ', note);
    this.piano.triggerAttack(note);
  }

  stopNote = (note: string) => {
    console.log('stop note: ', note);
    this.piano.triggerRelease(note, "+4n");
    // this.piano.triggerRelease(note);
  }

  render() {
    return (
      <div>
        <Keyboard playKey={this.playNote} stopKey={this.stopNote}/>
      </div>
    )
  }
}

export default Piano;