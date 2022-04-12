import { Reducer, Store, Middleware } from 'redux';
import { EXTRA_REDUCER, MIDDLEWARES } from './constants';

export type IAction = { type: string; payload: Record<string, any> };
export type reducer = Reducer<Record<string, any>, IAction>;
export type reducers = Record<string, Reducer<Record<string, any>, IAction>>;
export type IEffectFn = (...args: any[]) => Promise<any>;
export type IEffects = Record<string, IEffectFn>;
export type store = Store;

export interface IModel {
  namespace: string;
  state: Record<string, any>;
  reducers: Record<string, reducer>;
  effects?: IEffects;
}
export type IMiddleware = 'middleware';
export type IMiddlewares = 'middlewares';
export type IExtraReducers = 'extraReducers';

export type IHooks = {
  [MIDDLEWARES]?: ((...args: any[]) => Middleware)[];
  [EXTRA_REDUCER]?: reducers[];
};
export type IPluginKey = IMiddlewares | IExtraReducers;
