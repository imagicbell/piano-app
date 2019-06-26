import Midi from 'data/midi';

type MusicInputState = {
  musicXml: string,
  midi: Midi,
}

const initalState: MusicInputState = {
  midi: null,
  musicXml: null,
}

const musicInputReducer = (state: MusicInputState = initalState, action) => {
  switch(action.type) {
    case 'CHANGE_MIDI': 
      return {
        ...state,
        midi: action.midi
      };

    case 'CHANGE_MUSICXML': {
      return {
        ...state,
        musicXml: action.musicXml
      };
    }
    default: 
      return state;
  }
}

export default musicInputReducer;
