//@flow
import React from 'react';
import SampleLibrary from 'libs/Tonejs-Instruments';

class Piano extends React.Component {

  componentDidMount() {
    this.piano = SampleLibrary.load({
      instruments: "piano",
      baseUrl: "/res/samples/",
      onload: () => {
        console.log("load piano finish!!!");
      }
    }).toMaster();
  }

  render() {
    return (
      <div>
        
      </div>
    )
  }
}

export default Piano;