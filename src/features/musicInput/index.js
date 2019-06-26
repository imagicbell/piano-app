import React from 'react';
import { connect } from 'react-redux';
import FileDropzone from './fileDropzone';
import styles from './style.css';
import Midi from 'data/midi';
import { validURL } from 'utils/tools';
import { changeMidi, changeMusicXml } from './action';

export const FILE_FORMATS = {
  musicXml: 'MusicXML',
  midi: 'Midi'
};
export const FILE_EXTENSIONS = ['.mxl', '.musicxml', '.mid'];

type MusicInputProps = {
  dispatch: (a: *) => *
}

type MusicInputState = {
  midiJson: string,
  inputType: string,
  inputUrl: string,
}

class MusicInput extends React.Component<MusicInputProps, MusicInputState> {

  state: MusicInputState = {
    midiJson: '',
    inputType: FILE_FORMATS.musicXml,
    inputUrl: '',
  }

  midi: Midi = null;

  componentDidMount() {
  }

  onLoadMidi = (inputContent: string | ArrayBuffer) => {
    this.setState({
      ...this.state,
      midiJson: JSON.stringify(this.midi, undefined, 2),
    });

    this.props.dispatch(changeMidi(this.midi));
  }

  onChangeInputType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const inputType = e.target.value;
    this.setState({
      ...this.state,
      inputType: inputType,
    });
  }

  onInputUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const valid = url && validURL(url);
    
    this.setState({
      ...this.state,
      inputUrl: url,
      midiJson: valid ? "Parsing music file..." : '',
    });

    if (!valid) {
      this.props.dispatch(changeMidi(null));
      this.props.dispatch(changeMusicXml(null));
      return;
    }

    this.midi = new Midi();
    if (this.state.inputType === FILE_FORMATS.midi) {
      this.midi.loadMidi(url).then(this.onLoadMidi);
      this.props.dispatch(changeMusicXml(null));
    } else {
      this.midi.loadMusicXml(url).then(this.onLoadMidi);
      this.props.dispatch(changeMusicXml(url));
    }
  }

  onDropFile = (fileName: string, fileContent: ArrayBuffer) => {
    this.setState({
      ...this.state,
      midiJson: "Parsing music file...",
    });

    this.midi = new Midi();
    if (fileName.endsWith(".mid")) {
      this.midi.loadMidi(fileContent).then(this.onLoadMidi);
      this.props.dispatch(changeMusicXml(null));
    } else {
      const strContent = String.fromCharCode.apply(null, new Uint8Array(fileContent));
      this.midi.loadMusicXml(strContent).then(this.onLoadMidi);
      this.props.dispatch(changeMusicXml(strContent));
    }
  }

  render() {
    return (
      <div>
        <form className="url-form">
          <select className="url-type-select" 
                  value={this.state.inputType}
                  onChange={this.onChangeInputType}>
            {
              Object.keys(FILE_FORMATS).map(key => (
                <option key={key} value={FILE_FORMATS[key]}>{FILE_FORMATS[key]}</option>
              ))
            }
          </select>
          <input className="url-input"
                type="text" 
                placeholder="input music file's url here..."
                value={this.state.inputUrl}
                onChange={this.onInputUrl} />
        </form>
        
        <div className="dropzone">
          <FileDropzone fileFilters={FILE_EXTENSIONS} onDropFile={this.onDropFile}/>
        </div>               
        
        <textarea className="midi-json-area" 
                  placeholder="json output..." 
                  value={this.state.midiJson} 
                  readOnly />
      </div>
    );
  }
}

export default connect()(MusicInput);