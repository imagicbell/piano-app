// @flow
import React from 'react';
import styles from './index.css';
import { type NoteType, notes } from 'config/notes';

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

  pressKey = (note: NoteType) => {
    this.props.playKey(note.ansi);
  }

  releaseKey = (note: NoteType) => {
    this.props.stopKey(note.ansi);
  }

  render() {
    return (
      <div className="keyboard-container">
        {
          this.whiteKeys.map(key => (
            <div key={key.midi} className="key key-white" 
                 onPointerDown={e => this.pressKey(key)} onPointerUp={e => this.releaseKey(key)}>
              {key.ansi}
            </div>
          ))
        }
        {
          this.blackKeys.map(key => (
            <div key={key.midi} className="key key-black" 
                 onPointerDown={e => this.pressKey(key)} onPointerUp={e => this.releaseKey(key)}>
              {key.ansi}
            </div>
          ))
        }
      </div>
    )
  }
}

export default Keyboard;