//@flow
import React from 'react';
import Piano from 'features/piano';
import Midiplayer from 'features/midiplayer';
import MusicSheet from 'features/musicSheet';

function App() {
  return (
    <div>
      <Piano />
      <Midiplayer />
      <MusicSheet />
    </div>
  );
}

export default App;
