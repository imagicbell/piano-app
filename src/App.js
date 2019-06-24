//@flow
import React from 'react';
import Piano from 'features/piano';
import Midiplayer from 'features/midiplayer';
import MusicSheet from 'features/musicSheet';
import MusicInput from 'features/musicInput';

function App() {
  return (
    <div>
      <Piano />
      <MusicInput />
      {/* <Midiplayer /> */}
      {/* <MusicSheet /> */}
    </div>
  );
}

export default App;
