// @flow
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import './style.css';
import { type NoteType, notes, CalcNotePositions } from 'config/notes';
import { type ActiveKey } from './type';

type KeyboardProps = {
  playKey: (note: string) => void,
  stopKey: (note: string) => void,
  activeKeys: ActiveKey[],
}

class Keyboard extends React.Component<KeyboardProps> {
  whiteKeys: NoteType[];
  blackKeys: NoteType[];
  notePositions: any;

  constructor(props: KeyboardProps) {
    super(props);

    this.whiteKeys = notes.filter(note => note.type === 'white');
    this.blackKeys = notes.filter(note => note.type === 'black');

    this.notePositions = CalcNotePositions();
  }

  whiteKeyStyle() {
    return {
      width: `${this.notePositions.whiteWidth}%`,
    }
  };

  blackKeyStyle(note: NoteType, index: number) {
    let pos = this.notePositions.leftPositions.find(lp => lp.ansi === note.ansi);
    return {
      width: `${this.notePositions.blackWidth}%`,
      left: `${pos.left}%`,
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
          this.whiteKeys.map(key => {
            const className = classNames({
              'key-white': true,
              'key-white-active': this.props.activeKeys.findIndex(k => k.name === key.ansi) >= 0
            });
            return (
              <div key={key.midi} className={className} style={this.whiteKeyStyle()}
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
              'key-black-active': this.props.activeKeys.findIndex(k => k.name === key.ansi) >= 0
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