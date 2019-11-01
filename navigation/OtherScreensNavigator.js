import { createStackNavigator, createSwitchNavigator } from 'react-navigation';

import ProdDetailsScreen from '../src/screens/OtherScreens/ProdDetailsScreen';
import DoOrderScreen from '../src/screens/OtherScreens/DoOrderScreen';
import SelectClientScreen from '../src/screens/OtherScreens/SelectClientScreen';
import NewClientScreen from '../src/screens/OtherScreens/NewClientScreen';
import chooseProductsScreen from '../src/screens/OtherScreens/chooseProductsScreen';
import chooseTamCorScreen from '../src/screens/OtherScreens/chooseTamCorScreen';
import chooseQntScreen from '../src/screens/OtherScreens/chooseQntScreen';

const ProdDetailsStack = createStackNavigator({
	ProdDetails: ProdDetailsScreen,
});

const DoOrderStack = createStackNavigator({
	DoOrder: DoOrderScreen,
	SelectClient: SelectClientScreen,
	NewClient: NewClientScreen,
	chooseProducts: chooseProductsScreen,
	chooseTamCor: chooseTamCorScreen,
	chooseQnt: chooseQntScreen
});

export default createSwitchNavigator(
  {
    ProdDetailsStack,
    DoOrderStack
  }
);
