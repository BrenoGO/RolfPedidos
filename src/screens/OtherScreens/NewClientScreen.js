import React, { Component } from 'react';
import {
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
	Text,
	TextInput,
	TouchableOpacity,
	Button
} from 'react-native';
import { SQLite } from 'expo';

export default class NewClientScreen extends Component {
	static navigationOptions = {
		headerTitle: 'Novo Cliente',
	}

	state = {
		nomefantasia: '',
		razaosocial: '',
		cnpj: '',
		ie: '',
		colorIE: 'blue',
		cidade: '',
		estado: '',
		logradouro: '',
		num: '',
		colorSN: 'blue',
		complemento: '',
		bairro: '',
		CEP: '',
		email: '',
		contato: '',
		outroscontatos: ''
	}

	upState = (value, state) => {
		this.setState({ [state]: value });
	}

	ieIsento = () => {
		if (this.state.ie !== '') {
			this.setState({ ie: '', colorIE: 'blue' });
		} else {
			this.setState({ ie: 'ISENTO', colorIE: 'green' });
		}
	}

	SN = () => {
		if (this.state.num !== '') {
			this.setState({ num: '', colorSN: 'blue' });
		} else {
			this.setState({ num: 'SN', colorSN: 'green' });
		}
	}

	handleButtonConfirm = async () => {
		//fazer alguma confirmação?! tipo, alguma área essencial estar vazia..
		//ou CEP não conter 8 dígitos..
		//email não conter o @..
		//tudo isso em um if que dá return de algum alert
		let newIdUsuario = 0;
		const db = SQLite.openDatabase('db.db');
		db.transaction(
			tx => {
				tx.executeSql('SELECT max(id_usuario) as maxId FROM Clientes', 
					[], 
					(transaction, ResultSet) => {
						newIdUsuario = ResultSet.rows._array[0].maxId + 1;
					},
					(transaction, error) => {
						console.log('Erro ao buscar max id_usuario:', error);
					}				
				);
				tx.executeSql(
					`INSERT INTO Clientes (
					id_usuario,	razaosocial,	email, cnpj, ie, nomefantasia, contato, 
					outroscontatos, cidade, CEP, bairro, logradouro, num, complemento,
					estado, boolNew ) VALUES (
					?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[newIdUsuario, this.state.razaosocial, this.state.email, 
					this.state.cnpj, this.state.ie, this.state.nomefantasia,
					this.state.contato, this.state.outroscontatos, this.state.cidade, 
					this.state.CEP, this.state.bairro, this.state.logradouro, 
					this.state.num, this.state.complemento, this.state.estado, 'true'],
					(transaction, ResultSet) => {
						console.log(ResultSet);
					},
					(transaction, error) => {
						console.log('Erro ao inserir dados na tabela Clientes:', error);
					}
				);
			}
		);
		//após salvar os dados, como o sincronizar vai saber se tem novo cliente??
	}

	render() {
		//console.log('render NewClientScreen', this.state);
		return (
			<KeyboardAvoidingView
				behavior="padding"
			>
			<ScrollView>
				<TextInput
					style={styles.txtInput}
					placeholder="Nome Fantasia ou Apelido"
					value={this.state.nomefantasia}
					onChangeText={valueState => this.upState(valueState, 'nomefantasia')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="Razão Social ou Nome Completo"
					value={this.state.razaosocial}
					onChangeText={valueState => this.upState(valueState, 'razaosocial')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="CNPJ ou CPF (apenas números)"
					keyboardType="numeric"
					value={this.state.cnpj}
					onChangeText={valueState => this.upState(valueState, 'cnpj')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="IE (apenas números ou clique ISENTO)"
					keyboardType="numeric"
					value={this.state.ie}
					onChangeText={valueState => this.upState(valueState, 'ie')}
				/>
				<TouchableOpacity
					onPress={this.ieIsento}
				>
					<Text style={{ color: this.state.colorIE }}>ISENTO</Text>
				</TouchableOpacity>
				<TextInput
					style={styles.txtInput}
					placeholder="Cidade"
					value={this.state.cidade}
					onChangeText={valueState => this.upState(valueState, 'cidade')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="Estado (ex.: MG)"
					value={this.state.estado}
					onChangeText={valueState => this.upState(valueState, 'estado')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="Logradouro"
					value={this.state.logradouro}
					onChangeText={valueState => this.upState(valueState, 'logradouro')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="Número (apenas números ou clique SN)"
					keyboardType="numeric"
					value={this.state.num}
					onChangeText={valueState => this.upState(valueState, 'num')}
				/>
				<TouchableOpacity
					onPress={this.SN}
				>
					<Text style={{ color: this.state.colorSN }}>SN</Text>
				</TouchableOpacity>
				<TextInput
					style={styles.txtInput}
					placeholder="Complemento"
					value={this.state.complemento}
					onChangeText={valueState => this.upState(valueState, 'complemento')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="Bairro"
					value={this.state.bairro}
					onChangeText={valueState => this.upState(valueState, 'bairro')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="CEP (apenas números)"
					keyboardType="numeric"
					value={this.state.CEP}
					onChangeText={valueState => this.upState(valueState, 'CEP')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="E-mail"
					value={this.state.email}
					onChangeText={valueState => this.upState(valueState, 'email')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="Principal número de telefone"
					value={this.state.contato}
					onChangeText={valueState => this.upState(valueState, 'contato')}
				/>
				<TextInput
					style={styles.txtInput}
					placeholder="Outros contatos"
					value={this.state.outroscontatos}
					onChangeText={valueState => this.upState(valueState, 'outroscontatos')}
				/>
				<Button
					onPress={this.handleButtonConfirm}
					title='Confirmar'
				/>
			</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

const styles = StyleSheet.create({
	txtInput: {
		marginVertical: 5,
		backgroundColor: '#FFF',
		fontSize: 16,
		padding: 10
	}
});
