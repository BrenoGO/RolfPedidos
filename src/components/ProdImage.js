import React from 'react';
import { Image } from 'react-native';
import { FileSystem } from 'expo';

const noPic = require('../imgs/noPic.jpg');

export default class ProdImage extends React.Component {
	state = {
		source: null
	};

	componentWillMount() {
		//console.log('willMount do ProdImage');
		this.getSource();
	}
	componentDidUpdate = async() => {
		this.getSource();
		//console.log('didUpdate do ProdImage');
	}

	async getSource() {
		const { referencia } = this.props;
		const name = `fotoProd${referencia}-1.jpg`;
		const path = `${FileSystem.documentDirectory}${name}`;
		const image = await FileSystem.getInfoAsync(path);
		//console.log(path);
		if (image.exists) {
			//console.log('existe imagem de '+referencia);
			if (this.state.source === null) {
				this.setState({
					source: {
						uri: image.uri
					}
				});
			} else if (this.state.source.uri !== image.uri) {
				//console.log('entrou no if 1');
				this.setState({
					source: {
						uri: image.uri
					}
				});
			}
			return;
		}
		//console.log(path);
		if (this.state.source !== noPic) {
			//console.log('entrou no if 22');
			this.setState({
				source: noPic
			});
		}
		return;
	}
	render() {
		//console.log(`renderou ProdImage com ${this.props.referencia}`);
		//console.log(this.state.source);
		return (
			<Image 
				style={{ height: this.props.height, width: this.props.width }}
				source={this.state.source}
			/>
		);
	}
}
