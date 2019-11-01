import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../src/components/TabBarIcon';
import PedidosScreen from '../src/screens/Main/PedidosScreen';
import ProdutosScreen from '../src/screens/Main/ProdutosScreen';
import ClientesScreen from '../src/screens/Main/ClientesScreen';
import ConfiguracoesScreen from '../src/screens/Main/ConfiguracoesScreen';

const PedidosStack = createStackNavigator({
  Pedidos: PedidosScreen,
});

PedidosStack.navigationOptions = {
  tabBarLabel: 'Pedidos',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const ProdutosStack = createStackNavigator({
  Produtos: ProdutosScreen,
});

ProdutosStack.navigationOptions = {
  tabBarLabel: 'Produtos',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link'}
    />
  ),
};

const ClientesStack = createStackNavigator({
  Settings: ClientesScreen,
});

ClientesStack.navigationOptions = {
  tabBarLabel: 'Clientes',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options'}
    />
  ),
};

const ConfiguracoesStack = createStackNavigator({
  Settings: ConfiguracoesScreen,
});

ConfiguracoesStack.navigationOptions = {
  tabBarLabel: 'Configuracões',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options'}
    />
  ),
};

export default createBottomTabNavigator({
  PedidosStack,
  ProdutosStack,
  ClientesStack,
  ConfiguracoesStack,
});
