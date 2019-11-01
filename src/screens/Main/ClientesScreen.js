import React, { Component } from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	TextInput
} from 'react-native';
import { SQLite } from 'expo';

export default class SelectClientScreen extends Component {
	static navigationOptions = ({ navigation }) => ({
			headerTitle: 'Clientes',
	})

	state = {
		clients: '',
		searchClient: '',
		gotData: false,
		txtAboutClients: 'Buscando clientes....'
	}

	componentWillMount() {
		this.searchClients('');
	}

	searchClients = async searchClient => {
		const db = SQLite.openDatabase('db.db');
		db.transaction(
			tx => {
				tx.executeSql(
					'SELECT * FROM Clientes WHERE (razaosocial like ? or cidade like ? or nomefantasia like ?) ORDER BY razaosocial', 
					[`%${searchClient}%`, `%${searchClient}%`, `%${searchClient}%`],
					(transaction, ResultSet) => {
						//console.log(ResultSet);
						this.setState({ 
							clients: ResultSet.rows._array,
							gotData: true,
						});
					},
					(transaction, error) => {
						console.log('erro ao select * from Clientes: ', error);
						this.setState({ txtAboutClients: 'Não foi possível selecionar os Clientes, tente sincronizar' });
					}
				);
			}
		);
	}

	upSearchClient = searchClient => {
		this.setState({ searchClient });
		this.searchClients(searchClient);
	}

	_renderItem = item => (
		<View style={styles.eachClientView}>
			<Text style={styles.razaoSocial}>{item.razaosocial}</Text>
			<Text style={styles.city}>{item.cidade} / {item.estado}</Text>
		</View>
	);
	
	_renderFlatList = () => {
		if(this.state.gotData) {
			return(
				<FlatList
					style={{ marginBottom: 60}}
					data={this.state.clients}
					keyExtractor={item => String(item.id_usuario)}
					renderItem={({ item }) =>this._renderItem(item)}
				/>
			)
		}
		return(
			<View><Text>{this.state.txtAboutClients}</Text></View>
		)
		
	}
	render() {
		console.log('render SelectClientScreen');
		return (
			<View>
				<View style={styles.blockTxtInputView}>
					<View style={styles.txtInputView}>
						<TextInput
							style={styles.txtInput}
							placeholder="Razão Social, Nome Fantasia ou Cidade"
							value={this.state.searchClient}
							onChangeText={this.upSearchClient}
						/>
					</View>
				</View>
				{this._renderFlatList()}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	eachClientView: {
		borderBottomWidth: 1,
		backgroundColor: '#FFF'
	},
	razaoSocial: {
		fontSize: 20
	},
	city: {
		fontSize: 12
	},
	blockTxtInputView: {
		backgroundColor: '#FFF'
	},
	txtInputView: {
		backgroundColor: '#D3D3D3',
		margin: 10
	},
	txtInput: {
		height: 40,
	}
});
