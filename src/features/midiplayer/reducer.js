import Midi from 'data/midi';

type MidiplayerState = {
  midi: Midi,
}

const initialState: MidiplayerState = {
  midi: null,
}

const MidiplayerReducer = (state: MidiplayerState = initialState, action): MidiplayerState => {
  switch(action.type) {
    case 'CHANGE_MIDI': {
      return {
        ...state,
        midi: action.midi
      };
    }
    default: 
      return state;
  }
}

export default MidiplayerReducer;