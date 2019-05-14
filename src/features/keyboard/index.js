// @flow
import React from 'react';
import styles from './index.css';
import { type NoteType, notes } from 'config/notes';

type KeyboardProps = {
  playKey: (note: string) => void,
}

class Keyboard extends React.Component<KeyboardProps> {
  whiteKeys: NoteType[];
  blackKeys: NoteType[];

  constructor(props: KeyboardProps) {
    super(props);

    this.whiteKeys = notes.filter(note => note.type === 'white');
    this.blackKeys = notes.filter(note => note.type === 'black');
  }

  clickKey = (note: NoteType) => {
    console.log('click key: ', note.ansi);
    this.props.playKey(note.ansi);
  }

  render() {
    return (
      <div className="keyboard-container">
        {
          this.whiteKeys.map(key => (
            <div key={key.midi} className="key key-white" onClick={e => this.clickKey(key)}>
              {key.ansi}
            </div>
          ))
        }
        {
          this.blackKeys.map(key => (
            <div key={key.midi} className="key key-black" onClick={e => this.clickKey(key)}>
              {key.ansi}
            </div>
          ))
        }
      </div>
    )
  }
}

export default Keyboard;