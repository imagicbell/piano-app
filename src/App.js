//@flow
import React from 'react';
import EventSystemProvider from './utils/EventSystem';
import Rythmboard from 'features/rythm';
import Piano from 'features/piano';
import Midiplayer from 'features/midiplayer';
import MusicSheet from 'features/musicSheet';
import MusicInput from 'features/musicInput';

function App() {
  return (
    <div>
      <EventSystemProvider>
        <Rythmboard/>
        <Piano />
        <Midiplayer />
        <MusicInput />
        <MusicSheet />
      </EventSystemProvider>
    </div>
  );
}

export default App;
