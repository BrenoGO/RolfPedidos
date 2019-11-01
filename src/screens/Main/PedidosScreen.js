import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  AsyncStorage,
  FlatList
} from 'react-native';

export default class PedidosScreen extends React.Component {
	static navigationOptions = {
		title: 'Pedidos',
	};

	state = {
		Pedidos: []
	}

	componentWillMount() {
		console.log('compWillMount do PedidosScreen');
		this.upPedState();
	}

	upPedState = async () => {
		const strPedidos = await AsyncStorage.getItem('Pedidos');
		const Pedidos = JSON.parse(strPedidos);	
		//console.log(Pedidos);
		let arrayPedidos = [];
		for (const Ped in Pedidos) {
			arrayPedidos.push({ [Ped]: Pedidos[Ped] });
		}
		this.setState({ Pedidos: arrayPedidos });
	}

	header() {
		return (
			<View style={styles.headerView}>
				<View style={styles.headerTitle}>
					<Text>Confira seus pedidos</Text>
				</View>
				<TouchableHighlight 
					onPress={() => this.props.navigation.navigate(
						'DoOrder', { ifNew: true, id_usuario: null }
					)}
					style={styles.buttonAddPedido}
				>
					<Text style={styles.txtButtonAddPedido}>+</Text>
				</TouchableHighlight>
			</View>
		);
	}

	_renderItem = item => {
		//console.log(item);
		const arrayPed = Object.keys(item);
		const numPed = arrayPed[0];
		const { Cliente, produtos, inf } = item[numPed];
		let razaosocial = '';
		let styleRS = {};
		let ClientToProps = 'Cliente';
		let idToProps = null;
		if (Cliente.razaosocial === '') {
			razaosocial = 'Ainda não foi escolhido...';
			styleRS = { color: 'red' };
		} else {
			razaosocial = Cliente.razaosocial;
			ClientToProps = razaosocial;
			idToProps = Cliente.id;
		}
		let total = 0;
		if (produtos.length !== 0) {
			for (const Prod of produtos) {
				const preco = Prod.preco;
				//trabalha com Prod... total += Prod.preco*qnt
				let Qnt = 0;
				for (const k in Prod.corQnt) {	
					for (const i in Prod.corQnt[k]) {
						Qnt += Number(Prod.corQnt[k][i]);
					}
				}
				total += preco * Qnt;
			}
		}
		const styleTotal = (total === 0) ? { color: 'red' } : {};
		const styleTxtPedido = inf.finalizado ? { color: 'green' } : {};
		return (
			<TouchableHighlight
				onPress={() => this.props.navigation.navigate(
					'DoOrder',
					{ 
						ifNew: false,
						Pedido: numPed,
						Client: ClientToProps,
						id_usuario: idToProps
					})
				}
			>
				<View style={styles.eachViewPedido}>
					<Text style={styleTxtPedido}>Pedido {numPed} {this.resumPedServ(inf.pedServ)}</Text>
					<View style={styles.txtsClients}>
						<Text>Cliente: </Text><Text style={styleRS}>{razaosocial}</Text>
					</View>
					<Text style={styleTotal}>Total: R$ {total.toFixed(2).replace('.', ',')}</Text>
				</View>
			</TouchableHighlight>
		);
	}

	resumPedServ = pedServ => {
		const arraySplit = pedServ.split('-');
		const num = Number(arraySplit[1]);
		if (num) return `${arraySplit[0]}-${num}`;
		return '';
	}

	_render() {
		//console.log(this.state.Pedidos);
		if (this.state.Pedidos.length === 0) {
			return (
				<View>
					{this.header()};
					<View style={{ marginTop: 12 }}>
						<Text>Ainda não foram tirados pedidos deste Usuário neste aplicativo</Text>
					</View>
				</View>
			);	
		}
		return (
			<View>
				{this.header()};
				<FlatList
					data={this.state.Pedidos.reverse()}
					keyExtractor={item => { 
						const arrayPed = Object.keys(item);
						return arrayPed[0];
					}}
					renderItem={({ item }) => this._renderItem(item)}
				/>
			</View>
		);
	}

	render() {
		console.log('render PedidosScreen');
		return (
			<View>{this._render()}</View>
		);
	}
}

const styles = StyleSheet.create({
	headerView: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	headerTitle: {
		flex: 6,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#B2DFEE'
	},
	buttonAddPedido: {
		backgroundColor: '#00688B',
		flex: 2
	},
	txtButtonAddPedido: {
		fontSize: 30,
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center'
	},
	eachViewPedido: {
		paddingVertical: 5,
		paddingHorizontal: 2,
		borderBottomWidth: 1,
	},
	txtsClients: {
		flexDirection: 'row'
	}
});
