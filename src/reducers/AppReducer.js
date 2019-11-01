import {
	SINCRONIZANDO,
	END_SYNC,
	ERROR_SYNC,
	SET_PRODS,
	CHANGE_NEW_PICS
} from '../actions/types';

const INITIAL_STATE = {
	is_syncing: false,
	msg_error_sync: '',
	data_prod: '',
	txt_status: '',
	fotoUri: {},
	new_pics: 0
};

export default (state = INITIAL_STATE, action) => {
	console.log(`reducer----> type: ${action.type}`);
	//console.log(state);
	switch (action.type) {
		case SINCRONIZANDO:
			return { ...state, is_syncing: true, txt_status: action.payload };
		case END_SYNC:
			return { ...state, is_syncing: false, new_pics: true };
		case ERROR_SYNC:
			return { ...state, msg_error_sync: action.payload };
		case SET_PRODS:
			return { ...state, data_prod: action.payload };
		case CHANGE_NEW_PICS:
			if (state.new_pics === 0) {
				return { ...state, new_pics: 1 };
			}
			return { ...state, new_pics: 0 };
		/*
		case CHANGE_PIC_URI:
			return { ...state, fotoUri: { ...state.fotoUri, [action.ref]: action.uri } };
		*/
		default:
			return state;
	}
};
