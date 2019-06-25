//@flow

export const triggerKey = (key: string, duration: number) => {
  return dispatch => {
    dispatch({
      type: 'ACTIVE_KEY',
      key: key
    });

    setTimeout(() => {
      dispatch({
        type: 'DEACTIVE_KEY',
        key: key
      })
    }, duration * 1000);
  }
}