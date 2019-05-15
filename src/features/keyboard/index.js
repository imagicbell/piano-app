// @flow
import React from 'react';
import styles from './index.css';
import { type NoteType, notes } from 'config/notes';

const WHITE_KEY_WIDTH = 2.222;

type KeyboardProps = {
  playKey: (note: string) => void,
  stopKey: (note: string) => void,
}

class Keyboard extends React.Component<KeyboardProps> {
  whiteKeys: NoteType[];
  blackKeys: NoteType[];

  constructor(props: KeyboardProps) {
    super(props);

    this.whiteKeys = notes.filter(note => note.type === 'white');
    this.blackKeys = notes.filter(note => note.type === 'black');
  }

  whiteKeyStyle = {
    width: `${WHITE_KEY_WIDTH}%`,
  };

  blackKeyLeft = WHITE_KEY_WIDTH * 2/3;
  blackKeyStyle = (note: NoteType, index: number) => {
    if (index > 0) {
      this.blackKeyLeft += WHITE_KEY_WIDTH;
    }

    if (note.ansi[0] === 'C' || note.ansi[0] === 'F') {
      this.blackKeyLeft += WHITE_KEY_WIDTH; 
    }

    return {
      width: `${WHITE_KEY_WIDTH * 2/3}%`,
      left: `${this.blackKeyLeft}%`,
    }
  }

  pressKey = (note: NoteType) => {
    this.props.playKey(note.ansi);
  }

  releaseKey = (note: NoteType) => {
    this.props.stopKey(note.ansi);
  }

  render() {
    return (
      <div className="keyboard-container">
        <div className="key-wrap">
        {
          this.whiteKeys.map(key => (
            <div key={key.midi} className="key-white" style={this.whiteKeyStyle}
                 onPointerDown={e => this.pressKey(key)} onPointerUp={e => this.releaseKey(key)}>
                <span className="key-white-text">{key.ansi}</span> 
            </div>
          ))
        }
        {
          this.blackKeys.map((key, index) => (
            <div key={key.midi} className="key-black" style={this.blackKeyStyle(key, index)}
                 onPointerDown={e => this.pressKey(key)} onPointerUp={e => this.releaseKey(key)}>
                <span className="key-black-text">{key.ansi}</span>
            </div>
          ))
        }
        </div>
      </div>
    )
  }
}

export default Keyboard;