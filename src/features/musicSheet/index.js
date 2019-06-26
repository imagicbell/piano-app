// @flow
import React from 'react';
import { connect } from 'react-redux';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

type MusicSheetProps = {
  content: string,
}

type MusicSheetState = {

}

class MusicSheet extends React.Component<MusicSheetProps, MusicSheetState> {
  osmd: OpenSheetMusicDisplay;

  componentDidMount() {
    this.osmd = new OpenSheetMusicDisplay("osmd");
  }

  componentWillReceiveProps(nextProps: MusicSheetProps) {
    if (!nextProps.content) {
      this.osmd.clear();
      return;
    }
    this.osmd.load(nextProps.content).then(
      () => {
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

export default connect(
  state => ({
    content: state.musicInput.musicXml
  })
)(MusicSheet);