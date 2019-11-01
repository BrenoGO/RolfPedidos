import { connect } from 'react-redux';
import { createSwitchNavigator } from 'react-navigation';
import {
	reduxifyNavigator,
	createReactNavigationReduxMiddleware
} from 'react-navigation-redux-helpers';

import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import OtherScreensNavigator from './OtherScreensNavigator';

const NavReduxMiddleware = createReactNavigationReduxMiddleware(
	'root',
	state => state.nav,
);

const RootNavigator = createSwitchNavigator({
	Auth: AuthNavigator,
	Main: MainTabNavigator,
	OtherScreens: OtherScreensNavigator
},
{
	initialRouteName: 'Auth'
});

const AppWithNavigationState = reduxifyNavigator(RootNavigator, 'root');

const mapStateToProps = (state) => ({
  state: state.nav,
});

const AppNavigator = connect(mapStateToProps)(AppWithNavigationState);

export { RootNavigator, AppNavigator, NavReduxMiddleware };
