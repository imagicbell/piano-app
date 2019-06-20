import { 
  type Header,
  type Track,
  type Measure,
} from './type';
import ToneMidi from '@tonejs/midi';

export const parseHeader = (toneMidi: ToneMidi): [Header, Measure[]] => {
  let tmHeader = toneMidi.header;

  const header: Header = {
    name: tmHeader.name,
    tempos: tmHeader.tempos.map(tempo => ({
      bpm: tempo.bpm,
      time: tempo.time,
      measures: tmHeader.ticksToMeasures(tempo.ticks)
    })),
    timeSignatures: tmHeader.timeSignatures.map(ts => ({
      beats: ts.timeSignature[0],
      beatType: ts.timeSignature[1],
      time: tmHeader.ticksToSeconds(ts.ticks),
      measurs: ts.measures
    })),
    keySignatures: tmHeader.keySignatures.map(ks => ({
      key: ks.key,
      scale: ks.scale,
      time: tmHeader.ticksToSeconds(ks.ticks),
      measures: tmHeader.ticksToMeasures(ks.ticks),
    })),
  }

  const measures: Measure[] = [];
  let curTime = 0;
  let curTempoId = 0;
  let curTSId = 0;
  do {
    measures.push({id: measures.length, time: curTime});
    curTime += (60/header.tempos[curTempoId].bpm) * header.timeSignatures[curTSId].beats;
    if (curTempoId + 1 < header.tempos.length && curTime >= header.tempos[curTempoId + 1].time) {
      curTempoId++;
    }
    if (curTSId + 1 < header.timeSignatures.length && curTime >= header.timeSignatures[curTSId + 1].time) {
      curTSId++;
    }
  } while (curTime < toneMidi.duration);

  return [header, measures];
}

export const parseTracks = (toneMidi: ToneMidi): Track[] => {
  let tmTracks = toneMidi.tracks;
  const tracks: Track[] = new Array(tmTracks.length);

  tmTracks.forEach((tmTrack, trackIndex) => {
    tracks[trackIndex] = {
      name: tmTrack.name,
      instrument: {
        number: tmTrack.instrument.number,
        name: tmTrack.instrument.name,
      },
      notes: tmTrack.notes.map(note => ({
        midi: note.midi,
        name: note.name,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
      })),
    };
  });

  return tracks;
}



