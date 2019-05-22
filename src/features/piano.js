//@flow
import React from 'react';
import SampleLibrary from 'libs/Tonejs-Instruments';
import Keyboard from 'features/keyboard';

type PianoProps = {

}

class Piano extends React.Component<PianoProps> {
  piano: any;  

  componentDidMount() {
    this.piano = SampleLibrary.load({
      instruments: "piano",
      onload: () => {
        console.log("load piano finish!!!");
      }
    }).toMaster();
  }

  componentWillUnmount() {
    this.piano.dispose();
  }

  playNote = (note: string) => {
    console.log('play note: ', note);
    this.piano.triggerAttack(note);
  }

  stopNote = (note: string) => {
    console.log('stop note: ', note);
    this.piano.triggerRelease(note, "+4n");
  }

  playScheduleNote = (note: string, duration: string, time: string, velocity: number) => {
    console.log(`play schedule note: ${note}, duration: ${duration}, time: ${time}, velocity: ${velocity}`);
    this.piano.triggerAttackRelease(note, duration, time, velocity);
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