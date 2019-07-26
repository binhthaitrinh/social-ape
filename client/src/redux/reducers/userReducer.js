import { SET_USER, SET_AUTHENTICATED, SET_UNANTHENTICATED } from '../types';

const initialState = {
  authenticated: false,
  credentials: {},
  likes: [],
  notifications: []
};

export default function(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_AUTHENTICATED:
      return {
        ...state,
        authenticated: true
      };
    case SET_UNANTHENTICATED:
      return initialState;
    case SET_USER:
      return {
        authenticated: true,
        ...action.payload
      };
    default:
      return state;
  }
}
