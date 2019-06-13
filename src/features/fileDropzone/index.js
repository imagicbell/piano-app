//@flow
import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';

type FileDropzoneProps = {
  onDropFile: string => void;
}

const FileDropzone = (props: FileDropzoneProps) => {
  const onDrop = useCallback(acceptedFiles => {
    console.log("on drop files: ", acceptedFiles);

    const reader = new FileReader()
    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = () => {
      props.onDropFile && props.onDropFile(reader.result);
    }
    //only accept one file
    reader.readAsArrayBuffer(acceptedFiles[0]);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}

export default FileDropzone;