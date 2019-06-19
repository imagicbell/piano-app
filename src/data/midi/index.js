//@flow
import ToneMidi from '@tonejs/midi';
import { ReadMusicXml } from './musicxmlReader';
import { parseHeader, parseTracks } from './musicxmlParser';
import { type Header, type Track } from './type';

export default class Midi {
  header: Header;
  tracks: Track[];
  duration: number;

  /**
   * Load a MusicXML file
   * @param content is either the url of a file, or the string content of a .xml/.mxl file
   */
  loadMusicXml = async (content: string) => {
    let data = await ReadMusicXml(content);

    let measureTimes: number[];
    [this.header, measureTimes] = parseHeader(data);
    [this.tracks, this.duration] = parseTracks(data, this.header, measureTimes);

    console.log("parse musicxml header\n", this.header);
    console.log("parse musicxml tracks\n", this.tracks);
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
    
    //todo: Convert the Tonejs/Midi data structure to our's
  }
}