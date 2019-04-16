import * as React from "react";
import * as ReactDOM from "react-dom";

import { AppContainer } from "react-hot-loader";
import { Provider } from "react-redux";
// AppContainer is a necessary wrapper component for HMR

import App from "./components/App/App";
import configureStore from "./configureStore";

const store = configureStore();

const render = (Component: any) => {
  window.console.log("render called");
  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <Component />
      </AppContainer>
    </Provider>,
    document.getElementById("root")
  );
};

render(App);

// Hot Module Replacement API
// @ts-ignore
if (module.hot) module.hot.accept("./components/App/App", () => render(App));
