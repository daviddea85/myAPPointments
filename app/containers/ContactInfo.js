import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Image, AsyncStorage, ListView, View, Keyboard } from 'react-native';
import { Container, Label, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, ListItem } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
import ActionButton from 'react-native-action-button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
// const ContactsDevice = require('react-native-contacts');
import PouchDB from 'pouchdb-react-native';
import TextField from '../containers/common/TextField';

let DBCompanyConnection = null;

class Contacts extends Component {

	constructor(props) {
		super(props);
		const dsContacts = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		console.log('this.props.contactid');
		console.log(this.props.contactid);
		this.state = {
			contactid: this.props.contactid || '',
			contactinfo: '',
			showspinner: false,
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
						console.log('this.userLoggedId');
						console.log(this.userLoggedId);
						this.connectCompanyDb(true);
					}
				});
			}
		});
	}

	componentDidMount() {}

	componentWillReceiveProps(nextProps) {
		if (nextProps.goBack === true) {
			this.connectCompanyDb(true);
		}
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

	componentDidUpdate() {}

	componentWillUnmount() {}

	async getContactInfo() {
		console.log('this.state.contactid');
		console.log(this.state.contactid);
		console.log(this.props.contactid);
		const dsContacts = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const queryContacts = { selector: { doctype: 'contact', _id: this.state.contactid }, };
		const contactInfo = await DBCompanyConnection.find(queryContacts);
		console.log('contactInfo.docs');
		console.log(contactInfo.docs);
		this.setState({ contactinfo: contactInfo.docs[0] });
		// if (contactsInfo.docs.length > 0) {
		// 	for (let i = 0; i < contactsInfo.docs.length; i += 1) {
		// 		if (contactsInfo.docs[i].middleName !== '') {
		// 			contactsInfo.docs[i].fullName = contactsInfo.docs[i].givenName +' '+ contactsInfo.docs[i].middleName +' '+ contactsInfo.docs[i].familyName;
		// 		} else {
		// 			contactsInfo.docs[i].fullName = contactsInfo.docs[i].givenName +' '+ contactsInfo.docs[i].familyName;
		// 		}
		// 		contactsInfo.docs[i].telephone = '';
		// 		if (contactsInfo.docs[i].phoneNumbers.length > 0) {
		// 			const mobilePhone = _.find(contactsInfo.docs[i].phoneNumbers, { label: 'mobile' });
		// 			if (_.isEmpty(mobilePhone)) {
		// 				if (contactsInfo.docs[i].phoneNumbers.length > 0) {
		// 					contactsInfo.docs[i].telephone = contactsInfo.docs[i].phoneNumbers[0].number;
		// 				} else {
		// 					contactsInfo.docs[i].telephone = '';
		// 				}
		// 			} else {
		// 				contactsInfo.docs[i].telephone = mobilePhone.number;
		// 			}
		// 		}
		// 		contactsInfo.docs[i].email = '';
		// 		if (contactsInfo.docs[i].emailAddresses.length > 0) {
		// 			const email = _.find(contactsInfo.docs[i].emailAddresses, { label: 'home' });
		// 			if (_.isEmpty(email)) {
		// 				if (contactsInfo.docs[i].emailAddresses.length > 0) {
		// 					contactsInfo.docs[i].email = contactsInfo.docs[i].emailAddresses[0].email;
		// 				} else {
		// 					contactsInfo.docs[i].email = '';
		// 				}
		// 			} else {
		// 				contactsInfo.docs[i].email = email.email;
		// 			}
		// 		}
		// 	}
		// 	contactsInfo.docs = _.sortBy(contactsInfo.docs, ['fullName']);
		// 	this.setState({ contactsList: dsContacts.cloneWithRows(contactsInfo.docs) });
		// } else {
			// this.setState({ contactsList: dsContacts.cloneWithRows([]) });
		// }

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

	// async checkSettings() {
	// 	const querySettings = { selector: { doctype: 'settings', userid: this.userLoggedId }, };
	// 	const settingsInfo = await DBCompanyConnection.find(querySettings);
	// 	console.log('settingsInfo');
	// 	console.log(settingsInfo);
	// 	if (settingsInfo.docs.length > 0) {
	// 		if (settingsInfo.docs[0].importcontacts === true) {
	// 			console.log('settingsInfo.docs[0].importcontacts');
	// 			console.log(settingsInfo.docs[0].importcontacts);
	// 			this.getContactsFromDevice();
	// 		}
	// 	}
	// 	// this.setState({ usersList: usersList.docs });
	// }

	connectCompanyDb(isConnected) {
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			// this.checkSettings();
			this.getContactInfo();
		}
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	// <ListItem style={{ height: 100, backgroundColor: 'white' }} button onPress={() => { Actions.AppointmentsInfo({ appointmentid: appointment._id, title: 'Appointment', appointmentdate: appointment.date }); }}>


	// renderRowContacts(contact) {
	// 	return (
	// 		<ListItem>
	// 			<View
	// 				style={{
	// 					flex: 1,
	// 					flexDirection: 'row',
	// 				}}
	// 			>
	// 				{contact.thumbnailPath === '' &&
	// 					<Image
	// 						style={{
	// 							flex: 0.2,
	// 							marginRight: 12,
	// 							width: 80,
	// 							height: 80,
	// 							borderRadius: 80/2,
	// 							borderWidth: 2,
	// 							borderColor: 'steelblue',
	// 							backgroundColor: 'transparent',
	// 						}}
	// 						source={require('../img/contacts.png')}>
	// 					</Image>
	// 				}
	// 				{contact.thumbnailPath !== '' &&
	// 					<Image
	// 						style={{
	// 							flex: 0.2,
	// 							marginRight: 12,
	// 							width: 80,
	// 							height: 80,
	// 							borderRadius: 80/2,
	// 							borderWidth: 1,
	// 							borderColor: 'steelblue',
	// 							backgroundColor: 'transparent',
	// 						}}
	// 						source={{ uri: contact.thumbnailPath }}>
	// 					</Image>
	// 				}
	// 				<View
	// 					style={{
	// 						flex: 0.7
	// 					}}
	// 				>
	// 					<View style={{ flex: 1, flexDirection: 'row' }}>
	// 						<Text note>Name: {contact.fullName}</Text>
	// 					</View>
	// 					<View style={{ flex: 1, flexDirection: 'row' }}>
	// 						<Text note>Phone: {contact.telephone}</Text>
	// 					</View>
	// 					<View style={{ flex: 1, flexDirection: 'row' }}>
	// 						<Text note>Email: {contact.email}</Text>
	// 					</View>
	// 				</View>
	// 				<MaterialCommunityIcons
	// 					name="chevron-right"
	// 					style={{
	// 						fontSize: 30,
	// 						height: 40,
	// 						top: 25,
	// 						color: '#9b9cb1',
	// 						position: 'absolute',
	// 						right: 10,
	// 					}}
	// 				/>
	// 			</View>
	// 		</ListItem>
	// 	);
	// }

	// <TextField label="SKU Title" value={this.state.sku.name} onChangeText={value => this.setState({ sku: { ...this.state.sku, name: value } })} validate />
	// 							<TextField label="Imported ID" value={this.state.sku.importedid.toString()} onChangeText={value => this.setState({ sku: { ...this.state.sku, importedid: value } })} editable={false} />
	// 							<TextField label="Colour" value={this.state.sku.meta.colour} onChangeText={value => this.onChangeText(value, 'meta.colour')} />

	onChangeText(newValue, prop) {
		const incontact = this.state.contactinfo;
		incontact[prop] = newValue;
		this.setState({ contactinfo: incontact });
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Content style={{ paddingLeft: 10, paddingRight: 10, paddigTop: 10 }}>
					{this.state.showspinner && <Spinner /> }
					<TextField label="Name" value={this.state.contactinfo.givenName} onChangeText={value => this.onChangeText(value, 'givenName')} />
					<TextField label="Middle name" value={this.state.contactinfo.middleName} onChangeText={value => this.onChangeText(value, 'middleName')} />
					<TextField label="Family name" value={this.state.contactinfo.middleName} onChangeText={value => this.onChangeText(value, 'familyName')} />
					<TextField label="Company" value={this.state.contactinfo.company} onChangeText={value => this.onChangeText(value, 'company')} />
					<TextField label="Job title" value={this.state.contactinfo.middleName} onChangeText={value => this.onChangeText(value, 'jobTitle')} />
					<View style={{ height: 60 }} />
				</Content>
				<FooterMain activeArea="Contacts" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(Contacts);
