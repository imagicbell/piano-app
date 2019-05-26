//@flow

export const triggerKey = (key: String, duration: Number) => {
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