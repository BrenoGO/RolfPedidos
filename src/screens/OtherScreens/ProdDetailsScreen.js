import React from 'react';
import { 
  View,
  ScrollView,
  Text,
  Button,
  StyleSheet,
  TouchableHighlight,
  Modal
} from 'react-native';
import { SQLite } from 'expo';
import ProdImage from '../../components/ProdImage';
import CorImg from '../../components/CorImg';

export default class ProdDetailsScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      headerTitle: params.ref,
      headerLeft: (
        <Button
          onPress={() => {
            navigation.navigate('ProdutosStack');
          }}
          title="< Voltar"
        />
      ),
    };
  };

  state = {
    array_prod: '',
    colorInModal: '',
    showColorPic: false
  };
	
  componentDidMount() {
    const { params } = this.props.navigation.state;
    //console.log(this.props.navigation.state);
    const db = SQLite.openDatabase('db.db');
    db.transaction(
      tx => {
        tx.executeSql(
          'select * from produtos where ref=?',
          [params.ref],
          (transaction, ResultSet) => {
          //console.log(ResultSet);
            this.setState({
              array_prod: ResultSet.rows._array
            });
          },
          (transaction, error) => {
            console.log(error);
          }
        );
      }
    );
  }

	viewTamanhos(tamanhos) {
		const tams = tamanhos.split('/');
		const length = tams.length;
		//console.log(length);
		return tams.map((tam, i) => {
				//console.log(`i: ${i} - tam: ${tam}`);
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

	viewCores(StrCores) {
		const cores = StrCores.split(',');
		return cores.map((cor, i) => (
				<View style={styles.eachCor} key={i}>
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
			)
		);
	}

	render() {
		console.log('render ProdDetailsScreen');
		//console.log(this.state.array_prod[0]);
		const prod = this.state.array_prod[0] ? 
			this.state.array_prod[0] : 
			{ ref: '', descricao: '', refs_cores: '', tamanhos: '', preco: '' };
		return (
			<View>
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
						<Text style={styles.titleCores}>Cores:</Text>
						<View>
							{this.viewCores(prod.refs_cores)}
						</View>
					</View>
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
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
	titleCores: {
		fontSize: 20,
	},
	eachCor: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 2,
		borderBottomWidth: 1,
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
	}
});
