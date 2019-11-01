import React from 'react';
import { 
  View,
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  TouchableHighlight,
  Modal,
  Button,
  StatusBar
} from 'react-native';
import { SQLite } from 'expo';
import ProdImage from '../../components/ProdImage';
import CorImg from '../../components/CorImg';

export default class chooseTamCorScreen extends React.Component {

  static navigationOptions = () => ({
    headerMode: 'none',
    header: null
  });

  state = {
    array_prod: '',
    colorInModal: '',
    chosenProds: [],
    showColorPic: false
  };
	
  componentDidMount() {
    const { params } = this.props.navigation.state;
    const db = SQLite.openDatabase('db.db');
    db.transaction(
      tx => {
        tx.executeSql(
          'select * from produtos where ref=?',
          [params.ref],
          (transaction, ResultSet) => {
            this.setState({
              array_prod: ResultSet.rows._array,
              chosenProds: params.chosenProds
            });
          },
          (transaction, error) => {
            console.log(error);
          }
        );
      }
    );
  }

  componentWillReceiveProps(nextProps) {
		const { cor, qntTam, ref } = nextProps.navigation.state.params;
		const corQnt = { [cor]: qntTam };
		const { preco } = this.props.navigation.state.params;
		const chosenProds = this.state.chosenProds;
		let key = 0;
		let keyOfRef = 0;
		let exists = false;
		if (chosenProds.length > 0) {
			for (const Prod of chosenProds) {
				if (Prod.ref === ref) {
					exists = true;
					keyOfRef = key; 
					Prod.corQnt = { ...Prod.corQnt, ...corQnt };
					if (Object.keys(Prod.corQnt[cor]).length === 0) {
						delete Prod.corQnt[cor];
					}
				}
				key++;
			}
			if (!exists) {
				chosenProds.push({
					ref,
					preco,
					corQnt: { ...corQnt }
				});
			}
			if (Object.keys(chosenProds[keyOfRef].corQnt).length === 0) {
				chosenProds.splice(keyOfRef, 1);
			}
		} else {
			chosenProds.push({
				ref,
				preco,
				corQnt: { ...corQnt }
			});
		}
		this.setState({ chosenProds });
  }

	viewTamanhos(tamanhos) {
		const tams = tamanhos.split('/');
		const length = tams.length;
		return tams.map((tam, i) => {
				if (tam !== '') {
					if (length !== i + 2) {
						return (
							<Text style={styles.txtTamanhos} key={i}>{ tam }, </Text>
						);
					}
					return (
						<Text style={styles.txtTamanhos} key={i}>{ tam }</Text>
					);
				}
				return false;
			}
		);
	}

	somaQntCor = cor => {
		let QntPorCor = 0;
		const { ref } = this.props.navigation.state.params;
		const arChPr = this.state.chosenProds;
		for (const Prod of arChPr) {
			if (Prod.ref === ref) {
				for (const k in Prod.corQnt) {
					if (k === cor) {
						for (const i in Prod.corQnt[k]) {
							QntPorCor += Number(Prod.corQnt[k][i]);
						}
					}	
				}
			}
		}
		if (QntPorCor > 0) { return QntPorCor; }
		return '';
	}

	ifQnt = () => {
		const arChPr = this.state.chosenProds;
		for (const k in arChPr) {
			const arrayOfKeys = Object.keys(arChPr[k]);
			for (const i in arChPr[k][arrayOfKeys[0]]) {
				if (Number(arChPr[k][arrayOfKeys[0]][i]) > 0) return 'Qnt';
			}
		}
		return '';
	}

	viewCores(StrCores, tamanhos, ref) {
		const cores = StrCores.split(',');
		return cores.map((cor, i) => (
				<View style={styles.eachCor} key={i}>
					<View style={styles.picAndNameCor}>
						<TouchableHighlight
							onPress={() => {
								this.setState({ showColorPic: true, colorInModal: cor });
							}}
						>
							<CorImg
								refCor={cor}
								height={40}
								width={40}
							/>
						</TouchableHighlight>
						<Text style={styles.txtEachCor}>{cor}</Text>
					</View>
					<View>
						<Text>{this.somaQntCor(cor)}</Text>
					</View>
					<View>
						<TouchableHighlight
							onPress={() => this.props.navigation.navigate('chooseQnt', 
								{
									ref,
									tamanhos,
									cor,
									chosenProds: this.state.chosenProds
								}
							)}
						>
						<Text style={styles.escolherButton}>Escolher</Text>
						</TouchableHighlight>
					</View>
				</View>
			)
		);
	}

	render() {
		//console.log('render chooseTamCorScreen. state.chosenProds', this.state.chosenProds);
		const prod = this.state.array_prod[0] ? 
			this.state.array_prod[0] : 
			{ ref: '', descricao: '', refs_cores: '', tamanhos: '', preco: '' };
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
				<Modal 
					transparent
					visible={this.state.showColorPic}
				>
					<View style={styles.modal}>
						<View style={styles.modalHeader}>
							<View style={styles.modalTitleHeader}>
								<Text style={styles.txtModalTitleHeader}>
									{this.state.colorInModal}
								</Text>
							</View>
							<TouchableHighlight 
								onPress={() => {
									this.setState({ showColorPic: false}); 
								}}
							>
								<View style={styles.xButton}>
									<Text>X</Text>
								</View>
							</TouchableHighlight>
						</View>
						<CorImg
							refCor={this.state.colorInModal}
							height={280}
							width={280}
						/>
					</View>
				</Modal>
				<View style={styles.header}>
					<Button
						title="Cancelar!"
						color='red'
						onPress={() => this.props.navigation.goBack()}
					/>
					<Text style={styles.headerTitle}>{prod.ref}</Text>
					<Button
						title="Salvar"
						onPress={() => this.props.navigation.navigate(
							'chooseProducts', 
							{ chosenProds: this.state.chosenProds }
						)}
					/>
				</View>
				<ScrollView>
					<View style={styles.descricao}>
						<Text style={styles.txtDescricao}>{prod.descricao}</Text>
						<Text style={styles.txtRef}>Referência: {prod.ref}</Text>
					</View>
					<View style={styles.image}>
						<ProdImage
							referencia={prod.ref}
							height={320}
							width={240}
						/>
					</View>
					<View style={styles.preco}>
						<Text style={styles.txtPreco}>Preço: R${prod.preco.replace('.', ',')}</Text>
					</View>
					<View style={styles.tamanhos}>
						<Text style={styles.txtTamanhos}>Tamanhos disponíveis: </Text>
						{this.viewTamanhos(prod.tamanhos)}
					</View>
					<View style={styles.cores}>
						<View style={styles.headerCores}>
							<View>
								<Text style={styles.titleCores}>Cores:</Text>
							</View>
							<View style={styles.titleQnt}>
								<Text>{this.ifQnt()}</Text>
							</View>
						</View>
						<View>
							{this.viewCores(prod.refs_cores, prod.tamanhos, prod.ref)}
						</View>
					</View>
				</ScrollView>
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
	descricao: {
		marginTop: 5,
		backgroundColor: '#fff',
		paddingVertical: 5
	},
	txtDescricao: {
		fontSize: 24
	},
	txtRef: {
		fontSize: 12
	},
	image: {
		marginTop: 20, 
		alignItems: 'center'
	},
	preco: {
		backgroundColor: '#fff',
		flexDirection: 'row',
		marginTop: 20,
		paddingVertical: 5
	},
	txtPreco: {
		fontSize: 18
	},
	tamanhos: {
		backgroundColor: '#fff',
		flexDirection: 'row',
		marginTop: 20,
		paddingVertical: 5
	},
	txtTamanhos: {
		fontSize: 18
	},
	cores: {
		backgroundColor: '#fff',
		marginTop: 20,
		paddingVertical: 5
	},
	headerCores: {
		flexDirection: 'row'
	},
	titleCores: {
		fontSize: 20,
	},
	titleQnt: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	eachCor: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 2,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
	},
	picAndNameCor: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	txtEachCor: {
		marginLeft: 10
	},
	modal: {
		flexDirection: 'column',
		marginTop: 50,
		marginLeft: 20,
		height: 330,
		width: 280,
		alignItems: 'center'
	},
	modalHeader: {
		backgroundColor: '#D3D3D3',
		flexDirection: 'row',
		height: 30
	},
	modalTitleHeader: {
		flex: 8,
		alignItems: 'center',
		justifyContent: 'center'
	},
	txtModalTitleHeader: {
		fontSize: 16,
		fontWeight: 'bold'
	},
	xButton: {
		backgroundColor: 'red',
		flex: 4,
		alignItems: 'center',
		justifyContent: 'center',
		height: 30,
		width: 30
	},
	escolherButton: {
		color: 'blue',
		marginRight: 10
	}
});
