import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AsyncStorage, ListView, View } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
// const ContactsDevice = require('react-native-contacts');
import PouchDB from 'pouchdb-react-native';

let DBCompanyConnection = null;

class Contacts extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			dataSource: ds.cloneWithRows([]),
			showspinner: false,
			active: false
		};
		this.companyDatabase = '';
		this.userLoggedId = '';
	}

	componentWillMount() {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {
						this.userLoggedId = userLoggedIdValue;
						this.connectCompanyDb(true);
					}
				});
			}
		});
	}

	componentDidMount() {}

	componentWillReceiveProps() {}

	componentDidUpdate() {}

	componentWillUnmount() {}

	async getContactsFromDevice() {

		console.log('ContactsDevice');
		console.log(ContactsDevice);

		// ContactsDevice.getAll((err, contacts) => {
		//   if(err === 'denied'){
		//     // error
		// 		console.log('error');
		//   } else {
		// 		console.log('contacts');
		// 		console.log(contacts);
		//     // contacts returned in []
		//   }
		// })

		// Contacts.getAll((err, contacts) => {
		//   if(err === 'denied'){
		//     // error
		//   } else {
		//     // contacts returned in []
		//   }
		// })
	}

	async checkSettings() {
		const querySettings = { selector: { doctype: 'settings', userid: this.userLoggedId }, };
		const settingsInfo = await DBCompanyConnection.find(querySettings);
		console.log('settingsInfo');
		console.log(settingsInfo);
		if (settingsInfo.docs.length > 0) {
			if (settingsInfo.docs[0].importcontacts === true) {
				console.log('settingsInfo.docs[0].importcontacts');
				console.log(settingsInfo.docs[0].importcontacts);
				this.getContactsFromDevice();
			}
		}
		// this.setState({ usersList: usersList.docs });
	}

	connectCompanyDb(isConnected) {
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.checkSettings();
		}
	}

	render() {
		return (
			<Container>
					<Header>
							<Body>
									<Title>Pag </Title>
							</Body>
					</Header>
					<Content padder>
					</Content>
					<ModalSide />
					<View>
						<Text>Action button</Text>
					</View>

					<FooterMain activeArea="Contacts" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(Contacts);
