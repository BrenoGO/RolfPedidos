import React from 'react';
import {
	View,
	SafeAreaView,
	ScrollView,
	KeyboardAvoidingView,
	Text,
	TextInput,
	StyleSheet,
	Button,
	TouchableHighlight,
	AsyncStorage,
	ActivityIndicator
} from 'react-native';

import DatePicker from 'react-native-datepicker';

export default class DoOrderScreen extends React.Component {
	static navigationOptions = () => ({
		header: null
	})

	state = {
		client: 'Cliente',
		id_usuario: null,
		produtos: [],
		dataEmissao: new Date(),
		dataEntrega: new Date(),
		prazopag: '',
		obs: '',
		sending: false,
		finalizado: false,
		pedServ: ''
	}

	async componentWillMount() {
		if (this.props.navigation.state.params.ifNew) {
			await this.novoPedido();
		} else {
			const { Client, id_usuario, Pedido } = this.props.navigation.state.params;
			await this.initState(Client, id_usuario, Pedido);
		}
	}

	async componentWillReceiveProps(nextProps) {		
		const paramsNextProps = nextProps.navigation.state.params;
		const { Pedido } = this.props.navigation.state.params;
		if (paramsNextProps.id_usuario !== this.state.id_usuario) {
			let Pedidos = await this.getPedidosAsync();
			Pedidos[Pedido].Cliente.id = paramsNextProps.id_usuario;
			Pedidos[Pedido].Cliente.razaosocial = paramsNextProps.razaosocial;
			Pedidos = JSON.stringify(Pedidos);
			await AsyncStorage.setItem('Pedidos', Pedidos);
			this.setState({ 
				client: paramsNextProps.razaosocial,
				id_usuario: paramsNextProps.id_usuario
			});
		}
		if (paramsNextProps.chosenProds) {
			const Pedidos = await this.getPedidosAsync();
			if (Pedidos[Pedido].produtos !== paramsNextProps.chosenProds) {
				Pedidos[Pedido].produtos = paramsNextProps.chosenProds;
			}
			await AsyncStorage.setItem('Pedidos', JSON.stringify(Pedidos));
			this.setState({ produtos: Pedidos[Pedido].produtos });
		}
	}

	getPedidosAsync = async () => {
		const strPedidos = await AsyncStorage.getItem('Pedidos');
		const Pedidos = JSON.parse(strPedidos);
		return Pedidos;
	}

	setDate = async (newDate, tipoDate) => {
		this.setState({ [tipoDate]: newDate });
		const Pedidos = await this.getPedidosAsync();
		const { Pedido } = this.props.navigation.state.params;
		Pedidos[Pedido].inf[tipoDate] = this.invertDate(newDate);
		await AsyncStorage.setItem('Pedidos', JSON.stringify(Pedidos));
	}

	setPrazopag = prazopag => {
		this.setState({ prazopag });
	}

	setObs = obs => {
		this.setState({ obs });
	}

	novoPedido = async () => {
		let Pedidos = await this.getPedidosAsync();
		if (!Pedidos) {
			Pedidos = {};
		}
		
		const numPed = this.proxPedido(Pedidos);
		this.props.navigation.setParams({ Pedido: numPed });
		
		let dataEmissao = this.strDateNow();
		let dataEntrega = this.strDatePlus30();

		const novoPedido = {
			inf: {
				dataEmissao,
				dataEntrega,
				finalizado: false,
				prazopag: '',
				obs: '',
				pedServ: ''
			},
			Cliente: {
				id: null,
				razaosocial: ''
			},
			produtos: []
		};

		Pedidos[numPed] = novoPedido;
		const strPed = JSON.stringify(Pedidos);
		await AsyncStorage.setItem('Pedidos', strPed, error => {
			if (error !== null) console.log(error);
		});

		dataEmissao = this.invertDate(dataEmissao);
		dataEntrega = this.invertDate(dataEntrega);
		this.setState({
			dataEmissao,
			dataEntrega
		});
	}

	proxPedido = objPed => {
		let maxKey = 0;
		for (const key in objPed) {
			if (key > maxKey) {
				maxKey = key;
			}
		}
		maxKey++;
		return (maxKey);
	}

	_renderClients = () => {
		if (this.state.finalizado) {
			return (
				<View style={styles.viewCliente}>
					<View style={styles.titlesCliente}>
						<Text style={styles.txtCliente}>
							{this.state.client}
						</Text>
					</View>
				</View>
			);
		}
		return (
			<TouchableHighlight
				onPress={() => this.props.navigation.navigate(
					'SelectClient',
					{ 
						ifNew: this.props.navigation.state.params.ifNew,
						Pedido: this.props.navigation.state.params.Pedido
					}
				)}
			>
				<View style={styles.viewCliente}>
					<View style={styles.titlesCliente}>
						<Text style={styles.txtCliente}>
							{this.state.client}
						</Text>
						<Text style={styles.txtToqueCliente}>Toque para alterar cliente</Text>
					</View>
					<View>
						<Text style={styles.txtSeta}>></Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	}

	_renderProdutos = () => {
		let qnt = 0;
		let total = 0;
		let resumProds = 'Nenhum produto escolhido';
		const produtos = this.state.produtos;
		if (produtos.length > 0) {
			for (const Prod of this.state.produtos) {
				let qntInProd = 0;
				const preco = Prod.preco;
				for (const k in Prod.corQnt) {	
					for (const i in Prod.corQnt[k]) {
						qntInProd += Number(Prod.corQnt[k][i]);
					}
				}
				qnt += qntInProd;
				total += qntInProd * preco;
			}
			total = total.toFixed(2).replace('.', ',');
			resumProds = `Qnt: ${qnt} peças, Total = R$ ${total}`;
		}
		if (this.state.finalizado) {
			return (
				<View style={styles.viewCliente}>
					<View style={styles.titlesCliente}>
						<Text style={styles.txtCliente}>
							Produtos
						</Text>
						<Text style={styles.resumProds}>{resumProds}</Text>
					</View>
				</View>
			);
		}
		return (
			<TouchableHighlight
					onPress={() => this.props.navigation.navigate(
						'chooseProducts', { produtos }
					)}
			>
				<View style={styles.viewCliente}>
					<View style={styles.titlesCliente}>
						<Text style={styles.txtCliente}>
							Produtos
						</Text>
						<Text style={styles.txtToqueCliente}>Toque para alterar produtos</Text>
						<Text style={styles.resumProds}>{resumProds}</Text>
					</View>
					<View>
						<Text style={styles.txtSeta}>></Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	invertDate = date => {
		const arSplit = date.split('-');
		return `${arSplit[2]}-${arSplit[1]}-${arSplit[0]}`;
	}

	strDateNow = () => {
		const d = new Date(Date.now());
    let month = String((d.getMonth() + 1));
    let day = String(d.getDate());
    const year = String(d.getFullYear());
     if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;
    return `${year}-${month}-${day}`;
	}

	strDatePlus30 = () => {
		const d = new Date(Date.now());
		d.setDate(d.getDate() + 30);
    let month = String((d.getMonth() + 1));
    let day = String(d.getDate());
    const year = String(d.getFullYear());
     if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;
    return `${year}-${month}-${day}`;
	}

	initState = async (client, id_usuario, Pedido) => {
		const Pedidos = await this.getPedidosAsync();
		const dataEmissao = this.invertDate(Pedidos[Pedido].inf.dataEmissao);
		let dataEntrega = Pedidos[Pedido].inf.dataEntrega;
		if (dataEntrega !== null) {
			dataEntrega = this.invertDate(dataEntrega);
		} else {
			dataEntrega = this.strDatePlus30();
			dataEntrega = dataEntrega = this.invertDate(dataEntrega);
		}
		const { prazopag, obs, finalizado, pedServ } = Pedidos[Pedido].inf;
		this.setState({ 
			client,
			id_usuario,
			produtos: Pedidos[Pedido].produtos,
			dataEmissao,
			dataEntrega,
			prazopag,
			obs,
			finalizado,
			pedServ
		});
	}

	saveInPedidosOnBlur = async (dado) => {
		const Pedidos = await this.getPedidosAsync();
		const { Pedido } = this.props.navigation.state.params;
		Pedidos[Pedido].inf[dado] = this.state[dado];
		await AsyncStorage.setItem('Pedidos', JSON.stringify(Pedidos));
	}

	sendOrder = async () => {
		this.setState({ sending: true });
		const Pedidos = await this.getPedidosAsync();
		const idVendedor = await AsyncStorage.getItem('userID');
		const { Pedido } = this.props.navigation.state.params;
		const dataArray = [Pedidos[Pedido], { idVendedor }];
		fetch(
			'https://rolfmodas.com.br/App/GetOrder.php',
			{
				method: 'post',
				header: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(dataArray)
			}
		)
		.then(response => response.json())
		.then(async responseJson => {
			console.log(responseJson);
			const arraySplit = responseJson.split('NUMPED');
			const pedServ = arraySplit[1];
			Pedidos[Pedido].inf.pedServ = pedServ;
			Pedidos[Pedido].inf.finalizado = true;
			await AsyncStorage.setItem('Pedidos', JSON.stringify(Pedidos));
			this.setState({ sending: false });
		});
	}

	finalizHeader = () => {
		if (this.state.finalizado) {
			return (
				<View style={{ borderBottomWidth: 1 }}>
					<Text style={{ color: 'red', fontWeight: 'bold' }}>
						Pedido Finalizado!
					</Text>
				</View>
			);
		}
	}

	resumPedServ = pedServ => {
		const arraySplit = pedServ.split('-');
		const num = Number(arraySplit[1]);
		return `${arraySplit[0]}-${num}`;
	}

	renderHeader = () => {
		const { ifNew, Pedido } = this.props.navigation.state.params;
		let Title = '';
		if (this.state.finalizado) {
			Title = this.resumPedServ(this.state.pedServ);
		} else {
			Title = ifNew ? `Novo Pedido (${Pedido})` : `Pedido ${Pedido}`;
		}
		
		return (
			<View style={styles.header}>
				<View style={{ zIndex: 2 }}>
					<Button
						title='< Voltar'
						onPress={() => { this.props.navigation.navigate('PedidosStack'); }}
					/>
				</View>
				<View style={styles.viewTitle}>
					<Text style={styles.headerTitle}>{Title}</Text>
				</View>
			</View>
		);
	}

	renderButtonEnviar = () => {
		if (!this.state.sending) {
			if (this.state.finalizado) {
				return (
					<View 
						style={{
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text 
							style={{
								color: 'red',
								fontWeight: 'bold',
								paddingVertical: 5
							}}
						>
							Já Finalizado
						</Text>
					</View>
				);	
			}
			return (
				<View>
					<Button
						title='Enviar Pedido'
						onPress={() => this.sendOrder()}
					/>
				</View>
			);
		}
		return (
			<View>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	renderInfsCompl = () => {
		if (this.state.finalizado) {
			return (
				<View>
					<Text>Data de Emissão</Text>
					<Text>{this.state.dataEmissao}</Text>
					<Text>Data de Entrega</Text>
					<Text>{this.state.dataEntrega}</Text>
					<Text>Prazo de Pagamento</Text>
					<Text>{this.state.prazopag}</Text>
					<Text>Outras informações</Text>
					<Text>{this.state.obs}</Text>
				</View>
			);
		}
		return (
			<View>
				<Text>Data de Emissão</Text>
				<DatePicker
					date={this.state.dataEmissao}
					mode='date'
					format='DD-MM-YYYY'
					confirmBtnText="Confirmar"
					cancelBtnText="Cancelar"
					onDateChange={newDate => this.setDate(newDate, 'dataEmissao')}
				/>
				<Text>Data de Entrega</Text>
				<DatePicker
					date={this.state.dataEntrega}
					mode='date'
					format='DD-MM-YYYY'
					confirmBtnText="Confirmar"
					cancelBtnText="Cancelar"
					onDateChange={newDate => this.setDate(newDate, 'dataEntrega')}
				/>
				<Text>Prazo de Pagamento</Text>
				<TextInput
					style={styles.txtInput}
					placeholder='exemplo: 30/60/90...'
					value={this.state.prazopag}
					onChangeText={this.setPrazopag}
					onBlur={() => this.saveInPedidosOnBlur('prazopag')}
					returnKeyType='done'
				/>
				<Text>Outras informações</Text>
				<TextInput
					style={styles.txtInput}
					placeholder='Observações'
					value={this.state.obs}
					onChangeText={this.setObs}
					onBlur={() => this.saveInPedidosOnBlur('obs')}
					returnKeyType='done'
				/>
			</View>
		);
	}

	render() {
		console.log('render DoOrderScreen');
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
				<View>{this.renderHeader()}</View>
				<View>{this.finalizHeader()}</View>
				<KeyboardAvoidingView
					behavior='padding'
				>
				<ScrollView 
					style={{ paddingBottom: 150 }}
					keyboardDismissMode='on-drag'
					keyboardShouldPersistTaps='always'
				>
					{this._renderClients()}
					{this._renderProdutos()}
					<View style={styles.viewInfComp}>
						<Text style={styles.titleInfComp}>Informações complementares</Text>
						{this.renderInfsCompl()}
					</View>
					{this.renderButtonEnviar()}
				</ScrollView>
				</KeyboardAvoidingView>
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
	viewTitle: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1
	},
	headerTitle: {
		fontWeight: 'bold',
		fontSize: 16
	},
	viewCliente: {
		flexDirection: 'row',
		paddingVertical: 20,
		borderBottomWidth: 1,
		justifyContent: 'space-between',
		backgroundColor: '#FFF'
	},
	titlesCliente: {

	},
	txtCliente: {
		fontSize: 20
	},
	txtToqueCliente: {
		fontSize: 10
	},
	txtSeta: {
		fontSize: 20,
		marginRight: 15
	},
	resumProds: {
		fontSize: 16
	},
	viewInfComp: {
		paddingBottom: 20,
		borderBottomWidth: 1,
		backgroundColor: '#FFF'
	},
	titleInfComp: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	txtInput: {
		borderWidth: 1,
		paddingVertical: 5,
		fontSize: 15
	}
});
