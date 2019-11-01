import { SQLite } from 'expo';

import {
	SINCRONIZANDO,
	END_SYNC,
	ERROR_SYNC,
	SET_PRODS,
	CHANGE_NEW_PICS
} from './types';

export const changeTextSinc = payload => ({ type: SINCRONIZANDO, payload });
export const endSync = () => ({ type: END_SYNC });
export const errorSync = payload => ({ type: ERROR_SYNC, payload });
export const setProds = Result => ({ type: SET_PRODS, payload: Result });
export const setNewPics = () => ({ type: CHANGE_NEW_PICS });

export const upProds = () => {
	return dispatch => {
		console.log('em UpProds');
		const db = SQLite.openDatabase('db.db');
		let Result = '';
		db.transaction(
			tx => {
				tx.executeSql(
					'select * from produtos;',
					[],
					(transaction, ResultSet) => {
						Result = ResultSet.rows._array;
						//console.log(`Result: ${Result}`);
						dispatch(setProds(Result));
					},
					(transaction, error) => {
						console.log(`erro ao selecionar produtos: ${error.message}`);
					}
				);
			}
		);
	};
};
