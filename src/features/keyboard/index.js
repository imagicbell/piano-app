// @flow
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import styles from './style.css';
import { type NoteType, notes } from 'config/notes';

const WHITE_KEY_WIDTH = 2.222;

type KeyboardProps = {
  playKey: (note: string) => void,
  stopKey: (note: string) => void,
  activeKeys: String[],
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
    this.blackKeyLeft = WHITE_KEY_WIDTH * 2/3;
    
    return (
      <div className="keyboard-container">
        <div className="key-wrap">
        {
          this.whiteKeys.map(key => {
            const className = classNames({
              'key-white': true,
              'key-white-active': this.props.activeKeys.findIndex(k => k === key.ansi) >= 0
            });
            return (
              <div key={key.midi} className={className} style={this.whiteKeyStyle}
                  onPointerDown={e => this.pressKey(key)} onPointerUp={e => this.releaseKey(key)}>
                  <span className="key-white-text">{key.ansi}</span> 
              </div>
            );
          })
        }
        {
          this.blackKeys.map((key, index) => {
            const className = classNames({
              'key-black': true,
              'key-black-active': this.props.activeKeys.findIndex(k => k === key.ansi) >= 0
            });
            return (
              <div key={key.midi} className={className} style={this.blackKeyStyle(key, index)}
                   onPointerDown={e => this.pressKey(key)} onPointerUp={e => this.releaseKey(key)}>
                  <span className="key-black-text">{key.ansi}</span>
              </div>
            );
          })
        }
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    activeKeys: state.keyboard.activeKeys,
  })
)(Keyboard);