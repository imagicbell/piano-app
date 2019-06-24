import React from 'react';
import FileDropzone from './fileDropzone';
import styles from './style.css';
import Midi from 'data/midi';
import { validURL } from 'utils/tools';

const FILE_FORMATS = {
  musicXml: 'MusicXML',
  midi: 'Midi'
};
const FILE_EXTENSIONS = ['.mxl', '.musicxml', '.mid'];

type MusicInputProps = {
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

  onLoadMidi = () => {
    this.setState({
      ...this.state,
      midiJson: JSON.stringify(this.midi, undefined, 2),
    });
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
    this.setState({
      ...this.state,
      inputUrl: url,
    });

    if (!url || !validURL(url)) {
      return;
    }

    this.setState({
      ...this.state,
      inputUrl: url,
      midiJson: "Parsing music file...",
    });

    this.midi = new Midi();
    if (this.state.inputType === FILE_FORMATS.midi) {
      this.midi.loadMidi(url).then(this.onLoadMidi);
    } else {
      this.midi.loadMusicXml(url).then(this.onLoadMidi);
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
    } else {
      const strContent = String.fromCharCode.apply(null, new Uint8Array(fileContent));
      this.midi.loadMusicXml(strContent).then(this.onLoadMidi);
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

export default MusicInput;