import React from 'react';
import {
  View, 
  Button,
  Text,
  ActivityIndicator,
  StyleSheet,
  AsyncStorage
} from 'react-native';
import { connect } from 'react-redux';
import { SQLite, FileSystem } from 'expo';

import { 
	changeTextSinc,
	endSync,
	errorSync,
	upProds,
	setNewPics
} from '../../actions/AppActions';

import { modificaSenha } from '../../actions/AuthActions';

class ConfiguracoesScreen extends React.Component {
	static navigationOptions = {
		title: 'Configurações',
	};
	
	funcMaxCol = (Json) => {
		let maxCol = 0;
		for (const i in Json) {
			maxCol++;
		}
		return maxCol;
	};
	
	SqlCreate = (Json) => {
		console.log('entrou em SqlCreate');
		let k = '';
		let i = '';
		let maxCol = 0;
		let strCreateTable = '';
		let strInsertRows = 'INSERT INTO produtos (';
		let columnsProdutos = '';
		let primeiroProduto = '';
		let count = 0;
		strCreateTable = 'CREATE TABLE IF NOT EXISTS produtos (';
		let colorsAr = [];//para saber quais cores disponiveis e fazer downloads das imagens..

		for (k in Json) {
			maxCol = this.funcMaxCol(Json[k]);

			if (k === '0') { //no primeiro produto formar o create table e o inicio do insert rows..
				for (i in Json[k]) {
					if (i === 'refs_cores') {
						const colors = Json[k][i].split(',');
						for (const cor of colors) {
							//console.log(cor);
							colorsAr = [...colorsAr, cor];
						}
						//console.log(colorsAr);
					}
					count++;
					strCreateTable = `${strCreateTable} ${i} text`;
					columnsProdutos = `${columnsProdutos} ${i}`;
					primeiroProduto = `${primeiroProduto} '${Json[k][i]}'`;
					if (count < maxCol) {
						strCreateTable = `${strCreateTable}, `;
						columnsProdutos = `${columnsProdutos}, `;
						primeiroProduto = `${primeiroProduto}, `;
					} 
				}
				count = 0;
				strInsertRows = `${strInsertRows} ${columnsProdutos}) VALUES (${primeiroProduto})`;
			} else {
				strInsertRows = `${strInsertRows}, (`;
				for (i in Json[k]) {
					if (i === 'refs_cores') {
						const colors = Json[k][i].split(',');
						for (const cor of colors) {
							//console.log(cor);
							colorsAr = [...colorsAr, cor];
						}
						//console.log(colorsAr);
					}
					count++;
					strInsertRows = `${strInsertRows} '${Json[k][i]}'`;
					if (count < maxCol) {
						strInsertRows = `${strInsertRows}, `;
					}
				}
				count = 0;
				strInsertRows = `${strInsertRows})`;
			}
		}
		strCreateTable = `${strCreateTable} );`;
		return ({ strCreateTable, strInsertRows, colorsAr });	
	};

	downImgs = () => new Promise((resolve, reject) => {
		console.log('entrou em downImgs');
		this.props.changeTextSinc('Downloading Imagens');
		const db = SQLite.openDatabase('db.db');
		let Result = '';
		db.transaction(
			tx => {
				tx.executeSql(
					'select * from produtos;',
					[],
					async (transaction, ResultSet) => {
						Result = ResultSet.rows._array;
						//console.log(`em DownImgs: Result: ${Result}`);
						for (const prod of Result) {
							const name = `fotoProd${prod.ref}-1.jpg`;
							const path = `${FileSystem.documentDirectory}${name}`;
							const image = await FileSystem.getInfoAsync(path);
							if (image.exists) {
								console.log(`img ${prod.ref} exists`);
							} else {
								console.log(`não existe a foto de ${prod.ref}..`);
								const url = `https://rolfmodas.com.br/PCP/_fotos/${prod.ref}-1.jpg`;
								await FileSystem.downloadAsync(url, path)
									.then(() => {
										console.log(`download de ${prod.ref} efetuado`);
									})
									.catch(error => { console.log(error); });
							}
						}
						console.log('saiu do for-of loop imgs');
						this.props.setNewPics();
					},
					(transaction, error) => {
						console.log(`erro ao selecionar produtos: ${error.message}`);
						reject(error);
					}
				);
			}
		);
		resolve();
	})
	
	downColorsImgs = colorAr => new Promise(async (resolve, reject) => {
		console.log('entrou em downColorsImgs');
		//console.log(colorAr);
		for (const cor of colorAr) {
			const name = `fotoCor${cor}.jpg`;
			const path = `${FileSystem.documentDirectory}${name}`;
			const img = await FileSystem.getInfoAsync(path);
			if (img.exists) {
				console.log(`img da cor ${cor} existe`);
			} else {
				console.log(`NÃO existe a foto da cor ${cor}`);
				const url = `https://rolfmodas.com.br/PCP/_cores/${cor}.jpg`;
				await FileSystem.downloadAsync(url, path)
					.then(() => { console.log(`download da ${cor} efetuado`); })
					.catch(error => { console.log(error); reject(); });
			}
		}
		resolve();
		console.log('saiu do for-of loop colors');
	})

	syncProds = () => new Promise(async (resolve, reject) => {
		console.log('entrou em syncProds');
		const db = SQLite.openDatabase('db.db');
		await fetch('https://rolfmodas.com.br/App/Sincronizacao.php')
		.then(response => response.json())
		.then(responseJson => {
			const objSqlCreate = this.SqlCreate(responseJson);
			const { strCreateTable, strInsertRows, colorsAr } = objSqlCreate;
			db.transaction(
				tx => {
					tx.executeSql('drop table if exists produtos', [], 
						() => {
							console.log('Tabela Produtos Excluída');
						}, 
						(transaction, error) => {
							console.log('Erro ao tentar excluir produtos: ', error);
						}
					);
					tx.executeSql( //transaction para criar table produtos
						strCreateTable,
						[],
						() => { 
							console.log('tabela produtos criada'); 
						},
						(transaction, error) => {
							console.log(`erro ao criar tabela produtos: ${error.message}`);
							this.props.errorSync(`erro ao criar tabela produtos: ${error.message}`);
						}
					);
					tx.executeSql( //transaction para inserir dados na tabela produtos
						strInsertRows,
						[],
						async () => { 
							console.log('Dados em produtos inseridos');
							this.props.upProds();
							try {
								await this.downImgs();
								await this.downColorsImgs(colorsAr);
							} catch (error) { console.log(error); }
							
							resolve();
						},
						(transaction, error) => {
							console.log(`erro ao inserir dados: ${error.message}`);
							this.props.errorSync(`erro ao inserir dados: ${error.message}`);
						}
					);
				}
			);
		})
		.catch(error => {
			console.log(`erro no fetch sincronizacao.php: ${error.message}`);
			if (error.message.includes('Network request failed')) {
				this.props.errorSync('Erro na conecção com servidor sincronizando produtos..');
			} else {
				this.props.errorSync(error.message);
			}
			reject();
		});
	});

	changeBoolnewFalse = () => new Promise((resolve, reject) => {
		const db = SQLite.openDatabase('db.db');
		db.transaction( 
			tx => {
				tx.executeSql(
					'UPDATE Clientes SET boolNew = ? where boolNew = ?',
					['false', 'true'],
					() => {
						console.log('alterados boolNew pra false');
						resolve();
					},
					(transac, error) => {
						console.log('erro ao mudar boolNew pra false:', error);	
						reject(error);
					}
				);
			}
		);
	})

	sendNewClients = () => new Promise((resolve, reject) => {
		console.log('entrou em sendNewClients');
		const db = SQLite.openDatabase('db.db');
		db.transaction(
			tx => {
				tx.executeSql(
					'SELECT * FROM Clientes where boolNew = ?',
					['true'],
					async (transaction, ResultSet) => {
						if (ResultSet.rows._array[0]) {
							console.log('existe cliente com boolNew true');
							await fetch('https://rolfmodas.com.br/App/GetNewClients.php', 
								{
									method: 'post',
									header: {
										'Accept': 'application/json',
										'Content-type': 'application/json'
									},
									body: JSON.stringify(ResultSet.rows._array)
								}
							)
							.then(response => response.json())
							.then(async responseJson => {
								console.log(responseJson);
								/*
									na fase de teste o GetNewClients.php não está salvando no mysql 
									do servidor...
								*/
								try {
									await this.changeBoolnewFalse();
								} catch (error) { console.log(error); }
								resolve();
							})
							.catch(error => {
								console.log(error); 
								reject(error);
							});
						} else {
							console.log('TODOS CLIENTES COM boolNew false!');
							resolve();
						}
					},
					(transaction, error) => {
						console.log(
							'erro ao tentar selecionar os clientes com boolNew true:', error
						);
						resolve();
					}
				);
			}
		);
	})

	SqlCreateClients(Json) {
		console.log('entrou em SqlCreateClients');
		const strCreateTableClients = `CREATE TABLE IF NOT EXISTS Clientes (
		id_usuario integer PRIMARY KEY,	razaosocial text,	email text,	
		cnpj text, data_nascimento text, ie text, nomefantasia text, 
		contato text, outroscontatos text, cidade text, CEP text, bairro text, 
		logradouro text, num text, complemento text, estado text, boolNew text)`;
		let strInsertRowsClients = 'INSERT INTO Clientes (';
		let countClients = 1;
		for (const client in Json) {
			const maxCol = this.funcMaxCol(Json[client]);
			let count = 1;
			if (countClients === 1) { //no primeiro cliente formar o primeiro () das colunas
				for (const eachData in Json[client]) {
					strInsertRowsClients = `${strInsertRowsClients} ${eachData}`;
					if (count < maxCol) {
						strInsertRowsClients = `${strInsertRowsClients},`;
					} else {
						strInsertRowsClients = `${strInsertRowsClients}, boolNew) VALUES (`;
					}
					count++;
				}
			} else {
				strInsertRowsClients = `${strInsertRowsClients}, (`;
			}
			count = 1;
			for (const eachData in Json[client]) {
				strInsertRowsClients = `${strInsertRowsClients} '${Json[client][eachData]}'`;
				if (count < maxCol) {
					strInsertRowsClients = `${strInsertRowsClients},`;
				} else {
					strInsertRowsClients = `${strInsertRowsClients}, 'false')`;
				}
				count++;
			}
			countClients++;
		}
		return ({ strCreateTableClients, strInsertRowsClients });
	}

	syncClients = () => new Promise(async (resolve, reject) => {
		console.log('entrou no syncClients');
		await fetch('https://rolfmodas.com.br/App/SyncClients.php')
		.then(response => response.json())
		.then(async responseJson => {
			const strsSql = this.SqlCreateClients(responseJson);
			const { strCreateTableClients, strInsertRowsClients } = strsSql;
			const db = SQLite.openDatabase('db.db');
			db.transaction(
				tx => {
					tx.executeSql('drop table if exists Clientes', [],
						() => {
							console.log('tabela clientes foi excluída');
						},
						(transaction, error) => { 
							console.log('erro excluindo tabela Clientes');
							console.log(error);
							reject(error);
						}
					);
					tx.executeSql(strCreateTableClients, [],
						() => {
							console.log('Tabela Clientes criada');
						},
						(transaction, error) => {
							console.log(`erro ao criar tabela Clientes: ${error.message}`);
							this.props.errorSync(`erro ao criar tabela Clientes: ${error.message}`);
							reject(error);						
						}
					);
					tx.executeSql(strInsertRowsClients, [],
						() => {
							console.log('Dados inseridos na tabela Clientes');
							resolve();
						},
						(transaction, error) => {
							console.log(`erro ao inserir dados na tabela Clientes: ${error.message}`);
							this.props.errorSync(`erro ao inserir dados na tabela Clientes: ${error.message}`);
							reject(error);
						}
					);
				}
			);
		})
		.catch(error => {
			console.log(`erro no fetch SyncClients.php: ${error.message}`);
			if (error.message.includes('Network request failed')) {
				this.props.errorSync('Erro na conecção com servidor sincronizando clientes..');
			} else {
				this.props.errorSync(error.message);
			}
			reject(error);
		});
	});

	async sincronizar() {
		this.props.changeTextSinc('Sincronizando');
		try { 
			await this.syncProds();
			await this.sendNewClients();
			await this.syncClients();
		} catch (error) { console.log(error); }
		//await this.sendNewClients();
		this.props.endSync(); 
	}

	deleteImgs() {
		this.props.changeTextSinc('Deletando IMGs');
		const db = SQLite.openDatabase('db.db');
		let Result = '';
		db.transaction(
			tx => {
				tx.executeSql(
					'select * from produtos;',
					[],
					(transaction, ResultSet) => {
						Result = ResultSet.rows._array;
						//console.log(`em DownImgs: Result: ${Result}`);
						const Finished = Result.map(async prod => {
							//console.log(prod.ref);
							const name = `fotoProd${prod.ref}-1.jpg`;
							const path = `${FileSystem.documentDirectory}${name}`;
							const image = await FileSystem.getInfoAsync(path);
							if (image.exists) {
								console.log(`img ${prod.ref} exists`);
								
								await FileSystem.deleteAsync(path)
									.then(() => { 
										console.log(`deletado IMG de ${prod.ref}`);
									})
									.catch(error => { console.log(error); });
							} else {
								console.log(`não existe a foto de ${prod.ref}..`);
							}
						});
						Promise.all(Finished).then(() => { 
							this.props.endSync(); 
							this.props.setNewPics();
						});
					},
					(transaction, error) => {
						console.log(`erro ao selecionar produtos: ${error.message}`);
					}
				);
			}
		);
	}

	limparPedidos = async () => {
		await AsyncStorage.removeItem('Pedidos');
	}

	teste() {
		const db = SQLite.openDatabase('db.db');
		db.transaction(
			tx => {
				tx.executeSql('select * from Clientes where boolNew = ?', ['true'],
					(transaction, ResultSet) => { console.log(ResultSet); },
					(transaction, error) => { console.log(error); }
				);
			}
		);
	}

	teste2() {
		tx.executeSql(
			'UPDATE Clientes SET boolNew = ? where boolNew = ?',
			['false', 'true'],
			() => {
				console.log('alterados boolNew pra false');
				resolve();
			},
			(transac, error) => {
				console.log('erro ao mudar boolNew pra false:', error);	
				reject(error);
			}
		);
	}

	logOutButton() {
		AsyncStorage.setItem('userID', '', error => {
			console.log(error);
		});
		console.log('antes do Navigation..');
		this.props.modificaSenha('');
		this.props.navigation.navigate('Auth');
	}
	
	_render() {
		if (!this.props.is_syncing) {
			return (
				<View>
					<Button
						title='Sincronizar'
						onPress={() => {
							console.log('prescionado button sinc');
							this.sincronizar();
						}}
					/>
					<Button
						title='Deletar imagens'
						onPress={() => {
							console.log('press button delete imgs');
							this.deleteImgs();
						}}
					/>
					<Button
						title='Limpar Pedidos'
						onPress={() => {
							console.log('press button limparPedidos');
							this.limparPedidos();
						}}
					/>
					<Button
						title='Teste'
						onPress={() => {
							console.log('press test');
							this.teste();
						}}
					/>
					<Button
						title='Teste 2!'
						onPress={() => {
							console.log('press test2');
							this.teste2();
						}}
					/>
					<Button
						title='Log Out'
						onPress={() => {
							console.log('press logOut');
							this.logOutButton();
						}}
					/>
					<Text style={styles.textErrorSync}>
						{this.props.msg_error_sync}
					</Text>
				</View>
			);
		}
		return (
			<View style={styles.viewLoading}>
				<ActivityIndicator size='large' />
				<Text style={styles.textLoading}>{this.props.txt_status}</Text>
			</View>
		);
	}
	render() {
		console.log('Render ConfiguracoesScreen');
		return (
			<View>
				{ this._render() }
			</View>
		);
	}
}

const styles = StyleSheet.create({
	viewLoading: {
		marginTop: 20,
		alignItems: 'center'
	},
	textLoading: {
		fontSize: 20,
	},
	textErrorSync: {
		color: 'red'
	}
});

const mapStateToProps = state => (
	{  
		is_syncing: state.AppReducer.is_syncing,
		msg_error_sync: state.AppReducer.msg_error_sync,
		txt_status: state.AppReducer.txt_status,
		new_pics: state.AppReducer.new_pics,
		fotoUri: state.AppReducer.fotoUri
	}
);
export default connect(mapStateToProps, 
    { 
		changeTextSinc,
		endSync,
		errorSync,
		upProds,
		setNewPics,
		modificaSenha
	}
    )(ConfiguracoesScreen);
