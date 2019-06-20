export type Tempo = {
  bpm: number,  //beats per minute
  tempo?: number, //quarter notes per minute
  time?: number,
  measures?: number,
}

export type TimeSignature = {
  beats: number,
  beatType: number,
  time?: number,
  measures?: number,
}

export type KeySignature = {
  key: string,
  scale: string,
  time?: number,
  measures?: number,
}

export type Velocity = {
  dynamics: number, //percentage of the standard MusicXML forte velocity
  time?: number,
  measures?: number,
}

export type Header = {
  name: string,
  tempos: Tempo[],
	timeSignatures: TimeSignature[],
  keySignatures: KeySignature[],
  velocities?: Velocity[],
}

export type Note = {
  midi: number,
	name: string,
  time: number,
  duration: number,
  velocity?: number,
}

export type Instrument = {
  number: number,
  name: string,
}

export type Track = {
  name: string,
	notes: Note[],
	instrument: Instrument,
}

export type Measure = {
  id: number,
  time: number, //start time in seconds of the measure
}
