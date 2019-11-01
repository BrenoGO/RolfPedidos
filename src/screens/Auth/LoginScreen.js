import React from 'react';
import { 
	View,
	TextInput,
	Text,
	StyleSheet,
	Button,
	ScrollView,
	ActivityIndicator 
} from 'react-native';
import { connect } from 'react-redux';
import { modificaId, modificaSenha, authUsuario } from '../../actions/AuthActions'; 

class LoginScreen extends React.Component {
	static navigationOptions = {
		title: 'Acesso',
	};
	_autenticarUsuario() {
        const { id, senha } = this.props;
        this.props.authUsuario(id, senha);
    }
    renderBtn() {
		if (this.props.loading_Login) {
            return (
                <ActivityIndicator size='large' />
            );
        }
		return (
			<Button
				title='Login'
				onPress={() => this._autenticarUsuario()}
			/>
		);
	}
	render() {
		console.log('render LoginScreen.js');
		//console.log(this.props);
		return (
			<ScrollView style={styles.fullScream}>
				<View style={styles.viewTitle}>
					<Text style={styles.texto}>Realize o Login</Text>
				</View>
				<View style={styles.viewForm}>
					<TextInput 
						value={this.props.id}
						style={styles.campos}
						placeholder= 'Id'
						placeholderTextColor='#DCDCDC'
						onChangeText={texto => this.props.modificaId(texto)}
					/>
					<TextInput
						value={this.props.senha}
						style={styles.campos}
						secureTextEntry
						placeholder= 'Senha'
						placeholderTextColor='#DCDCDC'
						onChangeText={texto => this.props.modificaSenha(texto)}
					/>
					<Text>{this.props.txt_erro_auth}</Text>
					<View>
						{this.renderBtn()}
					</View>
				</View>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	fullScream: {
		flex:1,
		marginTop: 5,
		padding: 10,
	},
	viewTitle: {
		flex: 1,
		alignItems: 'center'
	},
	viewForm: {
		flex: 4,
		justifyContent: 'center',
		alignItems: 'center'
	},
	texto: {
		fontSize: 25
	},
	campos: {
		margin: 15,
		backgroundColor: '#808080',
		height:30,
		width: 200,
		fontSize: 16,
		color: 'white'
	}
});


const mapStateToProps = state => (
	{  
		id: state.AuthReducer.id,
		senha: state.AuthReducer.senha,
		loading_Login: state.AuthReducer.loading_Login,
		txt_erro_auth: state.AuthReducer.txt_erro_auth,
		bool_auth: state.AuthReducer.bool_auth
	}
);
export default connect(mapStateToProps, 
    { modificaId, modificaSenha, authUsuario }
    )(LoginScreen);
