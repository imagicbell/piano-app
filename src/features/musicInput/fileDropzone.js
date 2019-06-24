//@flow
import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';

type FileDropzoneProps = {
  fileFilters: Array<string>,
  onDropFile: (string, ArrayBuffer) => void,
}

const FileDropzone = (props: FileDropzoneProps) => {
  const onDrop = useCallback(acceptedFiles => {
    console.log("on drop files: ", acceptedFiles);

    //only accept one file
    const file = acceptedFiles[0];
    if (props.fileFilters.findIndex(filter => file.name.endsWith(filter)) < 0) {
      return;
    }

    const reader = new FileReader()
    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = () => {
      props.onDropFile && props.onDropFile(file.name, reader.result);
    }
    reader.readAsArrayBuffer(file);
  }, []);

  const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({onDrop});
  let acceptedFileName = null;
  if (acceptedFiles.length > 0) {
    acceptedFileName = acceptedFiles[0].name;
    if (props.fileFilters.findIndex(filter => acceptedFileName.endsWith(filter)) < 0) {
      acceptedFileName = null;
    }
  }

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p style={{color: 'grey'}}>Drop the file here ...</p> :
          <p style={{color: `${acceptedFileName? 'black' : 'grey'}`}}>
            {acceptedFileName || "Drag 'n' drop or click to select music file here. Only accept .mxl/.musicxml/.mid."}
          </p>
      }
    </div>
  )
}

export default FileDropzone;