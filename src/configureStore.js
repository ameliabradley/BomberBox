import rootReducer from './reducers';
import { createStore } from 'redux';

export default () => {
  const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  );

  if (process.env.NODE_ENV !== "production") {
    if (module.hot) {
      module.hot.accept("./reducers", () => {
        console.log('accept called!');
        store.replaceReducer(rootReducer);
      })
    }
  }

  return store;
};
