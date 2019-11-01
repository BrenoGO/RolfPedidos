import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Button,
} from 'react-native';

export default class chooseQntScreen extends Component {
	static navigationOptions = ({ navigation }) => ({
		headerTitle: navigation.state.params.cor,
		headerLeft: (
			<Button
				title='Cancelar'
				onPress={() => navigation.goBack()}
			/>	
    )
	})

	state = {
		qntTam: {} 
	}

	async componentWillMount() {
		const qntTam = await this.getQntCor();

		if (qntTam === {}) {
			const { tamanhos } = this.props.navigation.state.params;
			const arrayTams = tamanhos.split('/');
			for (const i of arrayTams) {
				if (i !== '') {
					qntTam[i] = '0';
				}
			}	
		}
		this.setState({ qntTam });
	}

	getQntCor = () => {
		const { ref, cor } = this.props.navigation.state.params;
		const Produtos = this.props.navigation.state.params.chosenProds;
		let qntTam = {};	
		for (const Prod in Produtos) {
			if (Produtos[Prod].ref === ref) {
				for (const i in Produtos[Prod].corQnt) {
					if (i === cor) {
						qntTam = Produtos[Prod].corQnt[i];
					}
				}
			}
		}
		return (qntTam);
	}

	handleChangeText = (qnt, tam) => {
		const qntTam = this.state.qntTam;
		const lastChar = qnt.substr(qnt.length - 1);
		const numbers = '0123456789';
		if (numbers.indexOf(lastChar) > -1) {
			qntTam[tam] = qntTam[tam] === '0' ? lastChar : qnt;
		}
		if (qntTam[tam] === '') {
			delete qntTam[tam];
		}
		this.setState({ qntTam });
	}

	_render() {
		//console.log(this.state);
		const { tamanhos } = this.props.navigation.state.params;
		const arrayTams = tamanhos.split('/');
		const kTams = arrayTams.length - 1;
		return (
			<View style={styles.container}>
				<View style={styles.table}>
					<View style={styles.rowTable}>
						{arrayTams.map((tam, id) => {
							if (id !== kTams) {
								return (
									<View style={styles.rowField} key={`header${id}`}>
										<Text style={styles.headerTitles}>{tam}</Text>
									</View>
								);
							}
							return false;
						})}
					</View>
					<View style={styles.rowTable}>
						{arrayTams.map((tam, id) => {
							if (id !== kTams) {
								if (id === 0) {
									return (
										<View style={styles.rowField} key={id}>
											<Text>Qnt</Text>
										</View>
									);
								}
								return (
									<View style={styles.rowField} key={id}>
										<TextInput
											style={styles.txtInput}
											placeholder='place'
											keyboardType='numeric'
											onChangeText={qnt => this.handleChangeText(qnt, tam)}
											value={this.state.qntTam[tam]}
										/>
									</View>
								);
							}
							return false;
						})}
					</View>
				</View>
				<View style={styles.buttonSave}>
					<Button
						title='Salvar'
						onPress={() => {
							this.props.navigation.navigate(
								'chooseTamCor',
								{ 
									qntTam: this.state.qntTam,
									cor: this.props.navigation.state.params.cor,
									ref: this.props.navigation.state.params.ref,
								}
							);
						}}
					/>
				</View>
			</View>
		);
	}
	render() {
		return (
			<View>
				{this._render()}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
	},
	buttonSave: {
		marginTop: 120
	},
	table: {
		flex: 1,
		alignItems: 'center',
		marginTop: 20
	},
	rowTable: {
		flexDirection: 'row',
		height: 50,
	},
	rowField: {
		width: 50,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1
	},
	headerTitles: {
		fontWeight: 'bold',
		fontSize: 20
	},
	txtInput: {
		color: 'black',
		width: 40,
		height: 40,
		backgroundColor: '#FFF'
	}
});
