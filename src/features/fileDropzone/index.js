import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';

type FileDropzoneProps = {
  onFilesDropped: File[] => void;
}

const FileDropzone = (props: FileDropzoneProps) => {
  const onDrop = useCallback(acceptedFiles => {
    console.log("on drop files: ", acceptedFiles);

    const reader = new FileReader()

    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = () => {
      // Do whatever you want with the file contents
      const binaryStr = reader.result
      console.log(binaryStr)
    }

    acceptedFiles.forEach(file => reader.readAsBinaryString(file))

    props.onFilesDropped && props.onFilesDropped(acceptedFiles);
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