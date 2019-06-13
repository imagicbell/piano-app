//@flow
import { MXLHelper, AJAX } from 'opensheetmusicdisplay';
import { parseScore } from 'musicxml-interfaces';

export default class MusicXml {

  document: {};

  /**
   * Load a MusicXML file
   * @param content is either the url of a file, or the string content of a .xml/.mxl file
   */
  load(content: string): Promise<{}> {
    const self: MusicXml = this;
    const str: string = content;

    console.log("@@@@\n",str);

    if (str.substr(0, 4) === "\x50\x4b\x03\x04") {
      // This is a zip file, unpack it first
      return MXLHelper.MXLtoXMLstring(str).then(
          (x: string) => {
            return self.load(x);
          },
          (err: any) => {
            throw new Error("Invalid MXL file: " + err);
          }
      );
    }
    
    // Javascript loads strings as utf-16, which is wonderful BS if you want to parse UTF-8 :S
    if (str.substr(0, 3) === "\uf7ef\uf7bb\uf7bf") {
      // UTF with BOM detected, truncate first three bytes and pass along
      return self.load(str.substr(3));
    }

    if (str.substr(0, 5) === "<?xml") {
      // Parse the string representing an xml file
      self.document = parseScore(str);
      return Promise.resolve({});
    }

    if (str.length < 2083) {
      // Assume now "str" is a URL, Retrieve the file at the given URL
      // return AJAX.ajax(str).then(
      //   (s: string) => { return self.load(s); },
      //   (exc: Error) => { throw exc; }
      // );

      let contentType = str.indexOf(".mxl") > -1 ? "application/octet-stream" : "application/xml";
      console.log(">>>>> ", contentType);

      return fetch(str, {
        headers: new Headers({ "Content-Type": contentType })
      })
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)))
      .then(text => self.load(text))
      .catch(err => {
        throw new Error("Invalid MXL/XML file: " + err);
      });

      
    }
  }
}
