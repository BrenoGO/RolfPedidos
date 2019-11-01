import { combineReducers } from 'redux';
import { createNavigationReducer } from 'react-navigation-redux-helpers';

import { RootNavigator } from '../../navigation/AppNavigator';
import AuthReducer from './AuthReducer';
import AppReducer from './AppReducer';

const nav = createNavigationReducer(RootNavigator);

export default combineReducers({
    AuthReducer,
    AppReducer,
	nav
});
