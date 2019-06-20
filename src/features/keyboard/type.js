export type ActiveKey = {
  name: string,
  refCount: number,
}

export type KeyboardState = {
  activeKeys: ActiveKey[],
}