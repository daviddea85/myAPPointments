import './shim.js';
import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';

import configureStore from './app/configureStore';
import AppContainer from './app/AppContainer';

const store = configureStore({});
const App = () => (
    <Provider store={store}>
      <AppContainer />
    </Provider>
);
AppRegistry.registerComponent('myAPPointments', () => App);
