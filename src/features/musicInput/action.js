export const changeMidi = midi => ({
  type: "CHANGE_MIDI",
  midi,
});

export const changeMusicXml = musicXml => ({
  type: "CHANGE_MUSICXML",
  musicXml
});