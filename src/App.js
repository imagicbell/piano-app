//@flow
import React from 'react';
import Rythmboard from 'features/rythm';
import Piano from 'features/piano';
import Midiplayer from 'features/midiplayer';
import MusicSheet from 'features/musicSheet';
import MusicInput from 'features/musicInput';

function App() {
  return (
    <div>
      <Rythmboard/>
      <Piano />
      <Midiplayer />
      <MusicInput />
      <MusicSheet />
    </div>
  );
}

export default App;
