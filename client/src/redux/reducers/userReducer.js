import {
  SET_USER,
  SET_AUTHENTICATED,
  SET_UNANTHENTICATED,
  LOADING_USER,
  LIKE_SCREAM,
  UNLIKE_SCREAM
} from '../types';

const initialState = {
  authenticated: false,
  credentials: {},
  loading: false,
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
        loading: false,
        ...action.payload
      };
    case LOADING_USER:
      return {
        ...state,
        loading: true
      };
    case LIKE_SCREAM:
      return {
        ...state,
        likes: [
          ...state.likes,
          {
            userHandle: state.credentials.handle,
            screamId: payload.screamId
          }
        ]
      };
    case UNLIKE_SCREAM:
      return {
        ...state,
        likes: state.likes.filter(like => like.screamId !== payload.screamId)
      };
    default:
      return state;
  }
}
