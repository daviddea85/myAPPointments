import React from 'react'
import { AppRegistry ,StatusBar} from 'react-native'

import configureStore from './app/configureStore'
import AppContainer from './app/AppContainer'

import { Provider } from 'react-redux'
const store = configureStore({})
const App = () => (
    <Provider store={store}>
      <AppContainer />
    </Provider>
)
AppRegistry.registerComponent('myAPPointments', () => App);
