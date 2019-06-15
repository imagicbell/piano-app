//@flow
import { MXLHelper } from 'opensheetmusicdisplay';
import { parseScore } from 'musicxml-interfaces';

export default class MusicXml {

  document: {};

  /**
   * Load a MusicXML file
   * @param content is either the url of a file, or the string content of a .xml/.mxl file
   */
  load = async (content: string) => {
    const self: MusicXml = this;
    const str: string = content;

    console.log("musicxml load \n", content);
    
    if (str.substr(0, 4) === "\x50\x4b\x03\x04") {
      // This is a zip file, unpack it first
      try {
        const xmlStr = await MXLHelper.MXLtoXMLstring(str);
        await self.load(xmlStr);
      } catch (err) {
        throw new Error("Invalid MXL file: " + err);
      }
    }
    
    // Javascript loads strings as utf-16, which is wonderful BS if you want to parse UTF-8 :S
    if (str.substr(0, 3) === "\uf7ef\uf7bb\uf7bf") {
      // UTF with BOM detected, truncate first three bytes and pass along
      await self.load(str.substr(3));
    }

    if (str.substr(0, 5) === "<?xml") {
      // Parse the string representing an xml file
      self.document = parseScore(str);
      return;
    }

    if (str.length < 2083) {
      // Assume now "str" is a URL, Retrieve the file at the given URL
      try {
        let isMXL = str.indexOf(".mxl") > -1;
        if (isMXL) {
          let response = await fetch(str, {headers: {"Content-Type": "application/octet-stream" }});
          let arrayBuffer = await response.arrayBuffer();
          let text = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
          await self.load(text);
        } else {
          let response = await fetch(str, {headers: {"Content-Type": "applicaton/xml"}});
          let text = await response.text();
          await self.load(text);
        }
      } catch(err) {
        throw new Error("Invalid MXL/XML file: " + err);
      }
    }
  }
}
