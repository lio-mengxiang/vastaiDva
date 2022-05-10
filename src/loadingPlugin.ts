import { Middleware } from 'redux';
import { HIDE, NAMESPACE, SHOW } from './constants';
import { reducer } from './definitions';

export default function createLoading() {
  const initalState: Record<string, any> = {
    effects: {}, // 用来收集每个namespace下的effects是true还是false
  };
  const extraReducers: { [NAMESPACE]: reducer } = {
    // 这里直接把写进combineReducer的reducer准备好，键名loading
    [NAMESPACE](state = initalState, { type, payload }) {
      const { actionType } = payload || {};
      switch (type) {
        case SHOW:
          return {
            effects: {
              ...state.effects,
              [actionType]: true,
            },
          };
        case HIDE:
          return {
            effects: {
              ...state.effects,
              [actionType]: false,
            },
          };
        default:
          return state;
      }
    },
  };

  const middleware: (...args: any[]) => Middleware =
    ({ effects }) =>
    ({ dispatch }) => {
      return (next) => async (action) => {
        if (typeof effects[action.type] === 'function') {
          dispatch({ type: SHOW, payload: { actionType: action.type } });
          const result = await next(action);
          dispatch({ type: HIDE, payload: { actionType: action.type } });
          return result;
        }
        return next(action);
      };
    };
  return {
    middlewares: middleware,
    extraReducers,
  };
}
