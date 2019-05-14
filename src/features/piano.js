//@flow
import React from 'react';
import SampleLibrary from 'libs/Tonejs-Instruments';
import Keyboard from 'features/keyboard';

class Piano extends React.Component {

  componentDidMount() {
    this.piano = SampleLibrary.load({
      instruments: "piano",
      onload: () => {
        console.log("load piano finish!!!");
      }
    }).toMaster();
  }

  render() {
    return (
      <div>
        <Keyboard />
      </div>
    )
  }
}

export default Piano;