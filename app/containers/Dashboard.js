import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AsyncStorage, ListView, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab, Tabs, Tab, TabHeading, Badge, Right  } from 'native-base';
import { Actions } from 'react-native-router-flux';
import MIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
import PouchDB from 'pouchdb-react-native';

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;

class Reports extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			dataSource: ds.cloneWithRows([]),
			showspinner: false,
			active: false,
			searchItem: ''
		};
		this.companyName = '';
		this.companyDatabase = '';
		this.accessType = '';
		this.userLoggedId = '';
	}

	componentWillMount() {}

	componentDidMount() { }

	componentWillReceiveProps() {
		AsyncStorage.getItem('companyName').then((companyNameValue) => {
			if (companyNameValue !== null) {
				this.companyName = companyNameValue;
			}
		});
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
			}
		});
		AsyncStorage.getItem('accessType').then((accessTypeValue) => {
			if (accessTypeValue !== null) {
				this.accessType = accessTypeValue;
			}
		});
	}

	componentDidUpdate() {}

	componentWillUnmount() { }

	render() {
		return (
			<Container>
				<Header hasTabs />

					<View style={{ flexDirection: 'row', backgroundColor: '#EFEFEF', padding: 3, alignItems: 'center' }}>
						<TextInput style={{ height: 28, borderColor: '#C0C0C0', borderWidth: 1, borderRadius: 6, flex: 1, backgroundColor: '#fff', color: '#424B4F', paddingLeft: 8 }} autoCorrect={false} returnKeyType="done" value={this.state.searchItem} onChangeText={value => this.setState({ searchItem: value })} />
						<TouchableOpacity style={{ marginLeft: 8, marginRight: 8 }} onPress={() => { console.log('click'); }}>
							<MIcons name="magnify" size={24} style={{ color: '#808080' }} />
						</TouchableOpacity>
						<TouchableOpacity style={{ marginLeft: 8, marginRight: 8 }} transparent small onPress={() => { console.log('click'); }}>
							<MIcons name="barcode-scan" size={24} style={{ color: '#808080' }} />
						</TouchableOpacity>
						<TouchableOpacity style={{ marginLeft: 8, marginRight: 8 }} onPress={() => { console.log('click'); }}>
							<MIcons name="qrcode-scan" size={24} style={{ color: '#808080' }} />
						</TouchableOpacity>
						<TouchableOpacity style={{ marginLeft: 8, marginRight: 8 }} onPress={() => { console.log('click'); }}>
							<MIcons name="nfc" size={24} style={{ color: '#808080' }} />
						</TouchableOpacity>
						<TouchableOpacity style={{ marginLeft: 8, marginRight: 8 }} onPress={() => { console.log('click'); }}>
							<MIcons name="nfc-variant" size={24} style={{ color: '#808080' }} />
						</TouchableOpacity>
					</View>

					<View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, backgroundColor: '#EFEFEF' }}>
						<Icon name="ios-calendar-outline" style={{ fontSize: 15, marginRight: 5, marginLeft: 10 }} />
						<Text style={{ fontSize: 12 }}>7 Days</Text>
						<Icon name="ios-pin-outline" style={{ fontSize: 15, marginRight: 5, marginLeft: 10 }} />
						<Text style={{ fontSize: 12 }}>All Locations</Text>
					</View>
					<Content style={{ padding: 5 }}>
						<View style={{ flexDirection: 'row' }}>
							<Card>
								<CardItem>
									<Body>
										<Text style={styles.CounterNumber}>102,023</Text>
										<Text style={styles.CounterLabel}>Total SKU's</Text>
									</Body>
								</CardItem>
							</Card>
							<Card>
								<CardItem>
									<Body>
										<Text style={styles.CounterNumber}>3,278,593</Text>
										<Text style={styles.CounterLabel}>Total Items</Text>
									</Body>
								</CardItem>
							</Card>
						</View>

						<View style={{ flexDirection: 'row' }}>
							<Card>
								<CardItem style={{ backgroundColor: '#E5FFCC' }}>
									<Body>
										<Text style={styles.CounterNumber}>15</Text>
										<Text style={styles.CounterLabel}>Spiking SKUs</Text>
									</Body>
								</CardItem>
							</Card>
							<Card>
								<CardItem style={{ backgroundColor: '#E5FFCC' }}>
									<Body>
										<Text style={styles.CounterNumber}>8</Text>
										<Text style={styles.CounterLabel}>Spiking Styles</Text>
									</Body>
								</CardItem>
							</Card>
						</View>

						<View style={{ flexDirection: 'row' }}>
							<Card>
								<CardItem style={{ backgroundColor: '#E5FFCC' }}>
									<Body>
										<Text style={styles.CounterNumber}>5</Text>
										<Text style={styles.CounterLabel}>Spiking Categories</Text>
									</Body>
								</CardItem>
							</Card>
							<Card>
								<CardItem style={{ backgroundColor: '#E5FFCC' }}>
									<Body>
										<Text style={styles.CounterNumber}>1</Text>
										<Text style={styles.CounterLabel}>Spiking Brands</Text>
									</Body>
								</CardItem>
							</Card>
						</View>

						<View style={{ flexDirection: 'row' }}>
							<Card>
								<CardItem style={{ backgroundColor: '#FFE5CC' }}>
									<Body>
										<Text style={styles.CounterNumber}>2</Text>
										<Text style={styles.CounterLabel}>Slowing SKU's</Text>
									</Body>
								</CardItem>
							</Card>
							<Card>
								<CardItem style={{ backgroundColor: '#FFE5CC' }}>
									<Body>
										<Text style={styles.CounterNumber}>12</Text>
										<Text style={styles.CounterLabel}>Slowing Styles</Text>
									</Body>
								</CardItem>
							</Card>
						</View>

						<View style={{ flexDirection: 'row' }}>
							<Card>
								<CardItem style={{ backgroundColor: '#FFE5CC' }}>
									<Body>
										<Text style={styles.CounterNumber}>1</Text>
										<Text style={styles.CounterLabel}>Slowing Categories</Text>
									</Body>
								</CardItem>
							</Card>
							<Card>
								<CardItem style={{ backgroundColor: '#FFF' }}>
									<Body>
										<Text style={styles.CounterNumber}>0</Text>
										<Text style={styles.CounterLabel}>Slowing Brands</Text>
									</Body>
								</CardItem>
							</Card>
						</View>

						<View style={{ flexDirection: 'row' }}>
							<Card>
								<CardItem style={{ backgroundColor: '#FFE5CC' }}>
									<Body>
										<Text style={styles.CounterNumber}>12</Text>
										<Text style={styles.CounterLabel}>Low stock warnings</Text>
									</Body>
								</CardItem>
							</Card>
							<Card>
								<CardItem style={{ backgroundColor: '#FFCCCC' }}>
									<Body>
										<Text style={styles.CounterNumber}>34</Text>
										<Text style={styles.CounterLabel}>Selling out soon</Text>
									</Body>
								</CardItem>
							</Card>
						</View>

						<View style={{ flexDirection: 'row' }}>
							<Card>
								<CardItem style={{ backgroundColor: '#FFCCCC' }}>
									<Body>
										<Text style={styles.CounterNumber}>3</Text>
										<Text style={styles.CounterLabel}>Dead Stock</Text>
									</Body>
								</CardItem>
							</Card>
							<Card>
								<CardItem style={{ backgroundColor: '#FFCCCC' }}>
									<Body>
										<Text style={styles.CounterNumber}>3</Text>
										<Text style={styles.CounterLabel}>Aging Stock</Text>
									</Body>
								</CardItem>
							</Card>
						</View>
						<View style={{ flexDirection: 'row' }}>
							<Card>
								<CardItem style={{ backgroundColor: '#FFF' }}>
									<Body>
										<Text style={styles.CounterNumber}>12</Text>
										<Text style={styles.CounterLabel}>Returns</Text>
									</Body>
								</CardItem>
							</Card>
						</View>
					</Content>
					<ModalSide />
					<FooterMain activeArea="Dashboard" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(Reports);
