import React from 'react';
import {
	View,
	SafeAreaView,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Button
} from 'react-native';
import { SQLite } from 'expo';

import ProdImage from '../../components/ProdImage';

export default class chooseProductsScreen extends React.Component {
	static navigationOptions = () => ({
			header: null
	})

	state = {
		searchedProd: '',
		chosenProds: [],
		Prods: [],
		Qnt: {}
	}

	async componentDidMount() {
		await this.searchProds('');
		this.setState({ chosenProds: this.props.navigation.state.params.produtos });
	}

	componentWillReceiveProps(nextProps) {
		const { params } = nextProps.navigation.state;
		if (params.chosenProds !== this.state.chosenProds) {			
			this.setState({
				chosenProds: [...this.state.chosenProds, ...params.chosenProds]
			});
		}
	}

	searchProds = searchedProd => {
		const db = SQLite.openDatabase('db.db');
		db.transaction(
			tx => {
				tx.executeSql(
					'select * from produtos where (ref like ? or descricao like ?) order by ref',
					[`%${searchedProd}%`, `%${searchedProd}%`],
					(transaction, ResultSet) => {
						this.setState({ Prods: ResultSet.rows._array });
					},
					(transaction, error) => {
						console.log('erro ao selecionar produtos: ', error);
					}
				);
			}
		);
	}

	upSearchedProd = searchedProd => {
		this.setState({ searchedProd });
		this.searchProds(searchedProd);
	}

	_renderItem = item => {
		if (!this.state.Qnt[item.ref]) {
			this.state.Qnt[item.ref] = 0;
		}
		let qnt = 0;
		const chosenProds = this.state.chosenProds;
		for (const Prod of chosenProds) {
			if (Prod.ref === item.ref) {
				for (const k in Prod.corQnt) {	
					for (const i in Prod.corQnt[k]) {
						qnt += Number(Prod.corQnt[k][i]);
					}
				}
			}
		}
		if (qnt === 0) qnt = '';
		return (
			<TouchableOpacity
				onPress={() => this.props.navigation.navigate('chooseTamCor', {
					ref: item.ref,
					preco: item.preco,
					chosenProds: this.state.chosenProds
				})}
			>
				<View style={styles.eachProdView}>
					<View>
						<ProdImage referencia={item.ref} height={80} width={60} />
					</View>
					<View>
						<Text>{item.ref}</Text>
						<Text>{item.descricao}</Text>
					</View>
					<View>
						<Text>{qnt}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	render() {
		console.log('render chooseProductsScreen');
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
				<View style={styles.header}>
					<Button
						color='red'
						title='Cancelar!'
						onPress={() => { this.props.navigation.goBack(); }}
					/>
					<Text style={styles.headerTitle}>Produtos</Text>
					<Button
						title="Salvar"
						onPress={() => this.props.navigation.navigate(
							'DoOrder', 
							{ chosenProds: this.state.chosenProds }
						)}
					/>
				</View>
				<View style={styles.blockTxtInputView}>
					<View style={styles.txtInputView}>
						<TextInput 
							style={styles.txtInput}
							placeholder="Buscar Produto"
							onChangeText={this.upSearchedProd}
						/>
					</View>
				</View>
				<FlatList
					data={this.state.Prods}
					extraData={this.props}
					keyExtractor={ item => item.ref }
					renderItem={({ item }) => this._renderItem(item)}
				/>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		backgroundColor: '#FFF',
		height: 60,
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1
	},
	headerTitle: {
		fontWeight: 'bold',
		fontSize: 16
	},
	eachProdView: {
		borderBottomWidth: 1,
		backgroundColor: '#FFF',
		flexDirection: 'row'
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
