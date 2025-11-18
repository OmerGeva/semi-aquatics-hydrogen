import { userActionTypes } from './user.types'

const INITIAL_STATE = {
  passwordGuessed: ''
}
const userReducer = (state = INITIAL_STATE, action: { type: string; payload: object }) => {
  switch (action.type) {
    case userActionTypes.SET_PASSWORD_GUESSED:
      return {
        ...state,
        passwordGuessed: action.payload
      }

    default:
      return state;
  }
}

export default userReducer;
