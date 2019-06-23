//@flow
import { MXLHelper } from 'opensheetmusicdisplay';
import { parseScore } from 'musicxml-interfaces';

/**
 * Load a MusicXML file
 * @param content is either the url of a file, or the string content of a .xml/.mxl file
 */
export const ReadMusicXml = async (content: string) => {
  const str: string = content;

  console.log("musicxml read \n", content);
  
  if (str.substr(0, 4) === "\x50\x4b\x03\x04") {
    // This is a zip file, unpack it first
    try {
      const xmlStr = await MXLHelper.MXLtoXMLstring(str);
      return await ReadMusicXml(xmlStr);
    } catch (err) {
      throw new Error("Invalid MXL file: " + err);
    }
  }
  
  // Javascript loads strings as utf-16, which is wonderful BS if you want to parse UTF-8 :S
  if (str.substr(0, 3) === "\uf7ef\uf7bb\uf7bf") {
    // UTF with BOM detected, truncate first three bytes and pass along
    return await ReadMusicXml(str.substr(3));
  }

  if (str.substr(0, 5) === "<?xml") {
    // Parse the string representing an xml file
    const data = parseScore(str);
    console.log("musicxml read \n", JSON.stringify(data));
    return data;
  }

  if (str.length < 2083) {
    // Assume now "str" is a URL, Retrieve the file at the given URL
    try {
      let isMXL = str.indexOf(".mxl") > -1;
      if (isMXL) {
        let response = await fetch(str, {headers: {"Content-Type": "application/octet-stream" }});
        let arrayBuffer = await response.arrayBuffer();
        let text = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
        return await ReadMusicXml(text);
      } else {
        let response = await fetch(str, {headers: {"Content-Type": "applicaton/xml"}});
        let text = await response.text();
        return await ReadMusicXml(text);
      }
    } catch(err) {
      throw new Error("Invalid MXL/XML file: " + err);
    }
  }
}
