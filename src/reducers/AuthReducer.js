import {
	MODIFICA_ID,
	MODIFICA_SENHA,
	LOADING_AUTH,
	ERRO_NA_AUTH,
	LOGIN_OK
} from '../actions/types';

const INITIAL_STATE = {
	id: '',
	senha: '',
	txt_erro_auth: '',
	loading_Login: false,
	bool_auth: false
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case MODIFICA_ID:
			return { ...state, id: action.payload };
		case MODIFICA_SENHA:
			return { ...state, senha: action.payload };
		case LOADING_AUTH:
			return { ...state, loading_Login: true };
		case ERRO_NA_AUTH:
			return { 
				...state, 
				txt_erro_auth: 'Id ou senha inválidos', 
				loading_Login: false, 
				id: '',
				senha: '' 
			};
		case LOGIN_OK:
			return { ...state, txt_erro_auth: '', loading_Login: false, bool_auth: true };
		case 'Navigation/NAVIGATE':
			return { ...state, navigation: action.routeName };
		default:
			return state;
	}
};
