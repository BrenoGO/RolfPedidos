import React from 'react';
import { Image } from 'react-native';
import { FileSystem } from 'expo';

export default class CacheImage extends React.Component {
	state = {
		source: null
	};
	
	componentWillMount = async () => {
		const { referencia } = this.props;
		const url= `https://rolfmodas.com.br/PCP/_fotos/${referencia}-1.jpg`;
		const name = `fotoProd${referencia}-1.jpg`;
		const path = `${FileSystem.documentDirectory}${name}`;
		const image = await FileSystem.getInfoAsync(path);
		if(image.exists) {
			console.log('imagem existe');
			//console.log(image.uri);
			this.setState( {
				source: {
					uri: image.uri,
				}
			})
			return;
		}
		console.log('downloading imagem');
		const newImage = await FileSystem.downloadAsync(url, path)
			.then(({uri}) => {
				//console.log('após o Then');
				//console.log(uri);
				this.setState({
				  source: {
					uri,
				  },
				});
			})
		
	}
	
	render() {
		console.log('renderizou CacheImage');
		//console.log(this.state.source);
		return (
			<Image style={{height: 200, width: 200}} source={this.state.source}/>
		);
	}
}

