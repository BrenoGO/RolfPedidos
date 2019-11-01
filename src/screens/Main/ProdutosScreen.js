import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableHighlight
  } from 'react-native';
import { connect } from 'react-redux';

import { upProds } from '../../actions/AppActions';

import ProdImage from '../../components/ProdImage';

//import CacheImage from '../../components/CacheImage';

class ProdutosScreen extends React.Component {
  static navigationOptions = {
    title: 'Produtos',
  };

  componentDidMount() {
    this.props.upProds();
  }

  _keyExtractor = (item) => item.ref;
  
  navigateToProd(ref) {
    this.props.navigation.navigate('ProdDetails', { ref });
  }

  render() {  
  //console.log('data_prod:'+this.props.data_prod);
	console.log('render ProdutosScreen');
    return (
      <View style={styles.container}>
        <FlatList
          data={this.props.data_prod}
          extraData={this.props}
          keyExtractor={this._keyExtractor}
          renderItem={ ({ item }) => (
            <TouchableHighlight 
              onPress={() => this.navigateToProd(item.ref)}
            >
              <View style={styles.viewLista}>
                <View>
                  <ProdImage 
                    referencia={item.ref} 
                    height={40}
                    width={30}
                  />
                </View>
                <View style={styles.viewTxts}>
                  <View>
                    <Text style={styles.txtLista}>
                      {item.descricao} - {item.ref}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.txtPreco}>
                      R$ {item.preco.replace('.', ',')}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableHighlight>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  viewLista: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 3,
    backgroundColor: '#fff',
    padding: 1
  },
  viewTxts: {
    
  },
  txtLista: {
    fontSize: 15
  },
  txtPreco: {
    fontSize: 15
  },
  imgProd: {
    height: 15,
    width: 10
  } 
});

const mapStateToProps = state => (
  {  
    data_prod: state.AppReducer.data_prod,
    new_pics: state.AppReducer.new_pics
  }
);

export default connect(mapStateToProps, 
    { upProds }
    )(ProdutosScreen);
