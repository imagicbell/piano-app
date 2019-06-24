//@flow
import ToneMidi from '@tonejs/midi';
import { ReadMusicXml } from './musicxmlReader';
import { parseHeader as parseHeader_musicxml, parseTracks as parseTracks_musicxml } from './musicxmlParser';
import { parseHeader as parseHeader_tonemidi, parseTracks as parseTracks_tonemidi } from './tonemidiParser';
import { type Header, type Track, type Measure } from './type';
import { validURL } from 'utils/tools';

export default class Midi {
  header: Header;
  tracks: Track[];
  measures: Measure[];
  duration: number;

  /**
   * Load a MusicXML file
   * @param content is either the url of a file, or the string content of a .xml/.mxl file
   */
  loadMusicXml = async (content: string) => {
    let data = await ReadMusicXml(content);

    [this.header, this.measures] = parseHeader_musicxml(data);
    [this.tracks, this.duration] = parseTracks_musicxml(data, this.header, this.measures);

    console.log("parse musicxml header\n", this.header);
    console.log("parse musicxml tracks\n", this.tracks);
  }

  /**
   * Load a Midi file
   * @param content is either the url of a file, or the string/ArrayBuffer content of a .mid file
   */
  loadMidi = async (content: string | ArrayBuffer) => {
    let toneMidi: ToneMidi;
    if (typeof content === "string" && validURL(content)) {
      toneMidi = await ToneMidi.fromUrl(content);
    } else {
      toneMidi = new ToneMidi(content);
    }

    console.log("tonejs midi\n", JSON.stringify(toneMidi, undefined, 2));
    
    [this.header, this.measures] = parseHeader_tonemidi(toneMidi);
    this.tracks = parseTracks_tonemidi(toneMidi);
    this.duration = toneMidi.duration;

    console.log("parse tonejs midi header\n", this.header);
    console.log("parse tonejs midi tracks\n", this.tracks);
  }
}