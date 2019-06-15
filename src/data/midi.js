//@flow
import ToneMidi from '@tonejs/midi';
import MusicXML from './musicxml';

export type Tempo = {
  bpm: number,
  time?: number,
}

export type TimeSignature = {
  beats: number,
  beatType: number,
  time?: number,
}

export type KeySignature = {
  key: string,
  scale: string,
  time?: number,
}

export type Header = {
  name: string;
	tempos: Tempo[];
	timeSignatures: TimeSignature[];
	keySignatures: KeySignature[];
}

export type Note = {
  time: number;
	midi: number;
	name: string;
	velocity: number;
	duration: number;
}

export type Instrument = {
  number: number,
  name: string,
}

export type Track = {
  name: string;
	notes: Note[];
	instrument: Instrument;
}

export default class Midi {
  header: Header;
  tracks: Track[];

  /**
   * Load a MusicXML file
   * @param content is either the url of a file, or the string content of a .xml/.mxl file
   */
  loadMusicXml = async (content: string) => {
    let musicxml = new MusicXML();
    await musicxml.load(content);
    
    //Todo: 
  }

  /**
   * Load a Midi file
   * @param content is either the url of a file, or the string/ArrayBuffer content of a .mid file
   */
  loadMidi = async (content: string | ArrayBuffer) => {
    let toneMidi: ToneMidi;
    if (typeof content === "string" && content.endsWith(".mid")) {
      toneMidi = await ToneMidi.fromUrl(content);
    } else {
      toneMidi = new ToneMidi(content);
    }
    return this.convertFromToneMidi(toneMidi);
  }

  /**
   * Convert the Tonejs/Midi data structure to our's
   */
  #convertFromToneMidi = (toneMidi: ToneMidi) => {

  }

}