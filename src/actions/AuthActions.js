import { NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native'; 

import {
	MODIFICA_ID,
	MODIFICA_SENHA,
	LOADING_AUTH,
	ERRO_NA_AUTH,
	LOGIN_OK
} from './types';

export const modificaId = texto => ({
	type: MODIFICA_ID,
	payload: texto
});

export const modificaSenha = texto => ({
	type: MODIFICA_SENHA,
	payload: texto
});

export const authUsuario = (id, senha) => {
	return dispatch => {
		dispatch({ type: LOADING_AUTH });
		fetch(
			'https://rolfmodas.com.br/App/Auth.php',
			{
				method: 'post',
				header: {
					Accept: 'application/json',
					'Content-type': 'application/json'
				},				
				body: JSON.stringify({
					id,
					senha,
				})
			}
		)
		.then(response => response.json())
		.then(responseJson => {
			console.log('responseJson: ');
			console.log(responseJson);
			if (responseJson !== 'no') {
				console.log('autenticação ok, redirecionar para Main');
				AsyncStorage.setItem('userID', responseJson, error => {
					console.log(error);
				});
				dispatch({ type: LOGIN_OK });
				dispatch(NavigationActions.navigate({ routeName: 'Main' }));
			} else {
				console.log('entrou no else, responseJson === no');
				dispatch({ type: ERRO_NA_AUTH });
			}
		})
		.catch(error => { 
			console.log(`erro no fetch: ${error}`);
			dispatch({ type: ERRO_NA_AUTH });
		});
	};
};
