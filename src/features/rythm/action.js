//@flow

export const previewKey = (key: string, duration: number) => ({
  type: 'PREVIEW_KEY',
  key,
  duration,
})

export const cleanPreview = () => ({
  type: 'CLEAN_PREVIEW'
})