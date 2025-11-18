import { userActionTypes } from './user.types';

export const setPasswordGuessed = (passwordGuessed: string) => ({
  type: userActionTypes.SET_PASSWORD_GUESSED,
  payload: passwordGuessed
})
