// @flow
import React from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import Midi from 'data/midi';

type MusicSheetProps = {

}

type MusicSheetState = {

}

class MusicSheet extends React.Component<MusicSheetProps, MusicSheetState> {

  osmd: OpenSheetMusicDisplay;

  componentDidMount() {
    this.osmd = new OpenSheetMusicDisplay("osmd");
    // this.osmd.load("/res/midi/5th_melody_of_the_night.mxl")
    // this.osmd.load("/res/midi/He_s_a_Fricking_Pirate.mxl")
    this.osmd.load("/res/midi/Fur_Elise.mxl")
    .then(() => {
      this.osmd.render()
    }, (e) => {
      console.log("music sheet load error\n", e);
    });
  }

  render() {
    return (
      <div id="osmd" style={{width: "1080px"}}></div>
    )
  }
}

export default MusicSheet;