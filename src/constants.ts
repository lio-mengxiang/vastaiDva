import { IMiddleware, IExtraReducers } from './definitions';

export const SHOW = '@@LOADING/SHOW';
export const HIDE = '@@LOADING/HIDE';
export const NAMESPACE = 'loading';
export const MIDDLEWARES = 'middlewares';
export const MIDDLEWARE: IMiddleware = 'middleware';
export const EXTRA_REDUCER: IExtraReducers = 'extraReducers';
