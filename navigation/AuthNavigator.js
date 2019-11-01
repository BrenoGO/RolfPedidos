import { createStackNavigator, createSwitchNavigator } from 'react-navigation';

import AuthLoadingScreen from '../src/screens/Auth/AuthLoadingScreen';
import LoginScreen from '../src/screens/Auth/LoginScreen';

const AuthStack = createStackNavigator({
	Login: LoginScreen,
});

export default createSwitchNavigator(
  {
    AuthLoadingScreen,
    AuthStack,
  },
  {
    initialRouteName: 'AuthLoadingScreen',
  }
);
