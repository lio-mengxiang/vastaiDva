import {
  createStore,
  applyMiddleware,
  combineReducers,
  Store,
  Middleware,
} from 'redux';
import loadingPlugin from './loadingPlugin';
import {
  IModel,
  IEffects,
  IAction,
  reducer,
  IExtraReducers,
  IMiddlewares,
} from './definitions';
import { EXTRA_REDUCER, MIDDLEWARES } from './constants';
import Plugin from './plugin';

class VastaiDva {
  // 存放所有model
  _models: IModel[];

  // createStore的结果
  store: Store | {};

  // 额外需要加载的plugin
  plugin: Plugin;

  effects: IEffects;

  constructor(plugin: Plugin) {
    this._models = [];
    this.store = {};
    this.effects = {};
    this.plugin = plugin;
  }

  /**
   * 注册model的方法
   * @param m model
   */
  addModel(model: IModel) {
    // 将model的reducer和effects加上scope
    const prefixmodel = this.prefixResolve(model);
    this._models.push(prefixmodel);
  }

  /**
   * 动态卸载model方法，目前没有需求暂不写
   */
  unModel() {}

  /**
   * prefixResolve 将model的reducer和effects加上scope
   */
  prefixResolve(model: IModel) {
    if (model.reducers) {
      model.reducers = this.addPrefix(model.reducers, model.namespace);
    }
    if (model.effects) {
      model.effects = this.addPrefix(model.effects, model.namespace);
    }
    this.addEffects(model.effects || {});
    return model;
  }

  addEffects(effects: IEffects) {
    for (const [key, value] of Object.entries(effects)) {
      this.effects[key] = value;
    }
  }

  addPrefix(obj: IModel['reducers'] | IEffects, namespace: string) {
    return Object.keys(obj).reduce((prev, next) => {
      prev[`${namespace}/${next}`] = obj[next];
      return prev;
    }, {});
  }

  /**
   *
   * @returns 将全部reducer合并为一个reducer
   */
  getReducer(): reducer {
    const reducers: IModel['reducers'] = {};
    for (const m of this._models) {
      // m是每个model的配置
      reducers[m.namespace] = function (
        state: Record<string, any> = m.state,
        action: IAction
      ) {
        // 组织每个模块的reducer
        const everyreducers = m.reducers; // reducers的配置对象，里面是函数
        const reducer = everyreducers[action.type]; // 相当于以前写的switch
        if (reducer) {
          return reducer(state, action);
        }
        return state;
      };
    }
    const extraReducers = this.plugin.get<IExtraReducers>(EXTRA_REDUCER);
    return combineReducers<Record<string, any>>({
      ...reducers,
      ...extraReducers,
    }); // reducer结构{reducer1:fn,reducer2:fn}
  }

  asyncMiddeWare(): Middleware {
    return ({ dispatch, getState }) => {
      return (next) => async (action) => {
        if (typeof this.effects[action.type] === 'function') {
          return this.effects[action.type](action.data, dispatch, getState);
        }
        return next(action);
      };
    };
  }

  start() {
    const middles = this.plugin
      .get<IMiddlewares>(MIDDLEWARES)
      .map((middleware) => middleware({ effects: this.effects }));
    const reducer = this.getReducer();
    this.store = applyMiddleware(
      ...middles,
      this.asyncMiddeWare()
    )(createStore)(reducer);
  }
}
const plugin = new Plugin();
const VastaiDvaInstance = new VastaiDva(plugin);
VastaiDvaInstance.plugin.use(loadingPlugin());

export default VastaiDvaInstance;
