import { IHooks, IPluginKey } from './definitions';
import { EXTRA_REDUCER, MIDDLEWARES } from './constants';

export default class Plugin {
  hooks: IHooks;

  constructor() {
    // 初始化把钩子都做成数组
    this.hooks = { [MIDDLEWARES]: [], [EXTRA_REDUCER]: [] };
  }

  use(plugin: Record<IPluginKey, any>) {
    // 因为会多次use，所以就把函数或者对象push进对应的钩子里
    const { hooks } = this;
    for (const key in plugin) {
      if (Object.prototype.hasOwnProperty.call(plugin, key)) {
        hooks[key].push(plugin[key as IPluginKey]);
      }
    }
  }

  get<T extends keyof IHooks>(key: T): IHooks[T] {
    // 不同的钩子进行不同处理
    if (key === EXTRA_REDUCER) {
      // 处理reducer，就把所有对象并成总对象，这里只能是对象形式才能满足后面并入combine的操作。
      return Object.assign({}, ...this.hooks[key]);
    }
    if (key === MIDDLEWARES) {
      return this.hooks[key]; // 其他钩子就返回用户配置的函数或对象
    }
  }
}
