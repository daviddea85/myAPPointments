import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Image, AsyncStorage, ListView, View, Keyboard, TouchableOpacity, TextInput } from 'react-native';
import { Container, Label, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, ListItem,
Spinner } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
import ActionButton from 'react-native-action-button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import PouchDB from 'pouchdb-react-native';

let DBCompanyConnection = null;

class Contacts extends Component {

	constructor(props) {
		super(props);
		const dsContacts = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			contactsList: dsContacts.cloneWithRows([]),
			showspinner: false,
			filtervalue: ''
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

	async getContacts(action) {
		this.setState({ showspinner: true });
		const dsContacts = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		// const queryContacts = { selector: { doctype: 'contact', userid: this.userLoggedId }, limit: 10 };
		if (action === 'filter') {
			this.queryContacts = { selector: { doctype: 'contact', userid: this.userLoggedId } };
		} else {
			this.queryContacts = {
				'selector': {
				'doctype': 'contact',
				'userid': this.userLoggedId,
					'$or': [
						{ 'givenName': { '$regex': this.state.filtervalue }},
						{ 'middleName': { '$regex': this.state.filtervalue }},
						{ 'familyName':  { '$regex': this.state.filtervalue }}
					]
				},
				'fields': []
			};
		}
		const contactsInfo = await DBCompanyConnection.find(this.queryContacts);
		console.log('contactsInfo.docs');
		console.log(contactsInfo.docs);
		if (contactsInfo.docs.length > 0) {
			for (let i = 0; i < contactsInfo.docs.length; i += 1) {
				if (contactsInfo.docs[i].middleName !== '') {
					contactsInfo.docs[i].fullName = contactsInfo.docs[i].givenName +' '+ contactsInfo.docs[i].middleName +' '+ contactsInfo.docs[i].familyName;
				} else {
					contactsInfo.docs[i].fullName = contactsInfo.docs[i].givenName +' '+ contactsInfo.docs[i].familyName;
				}
				contactsInfo.docs[i].telephone = '';
				if (contactsInfo.docs[i].phoneNumbers.length > 0) {
					const mobilePhone = _.find(contactsInfo.docs[i].phoneNumbers, { label: 'mobile' });
					if (_.isEmpty(mobilePhone)) {
						if (contactsInfo.docs[i].phoneNumbers.length > 0) {
							contactsInfo.docs[i].telephone = contactsInfo.docs[i].phoneNumbers[0].number;
						} else {
							contactsInfo.docs[i].telephone = '';
						}
					} else {
						contactsInfo.docs[i].telephone = mobilePhone.number;
					}
				}
				contactsInfo.docs[i].email = '';
				if (contactsInfo.docs[i].emailAddresses.length > 0) {
					const email = _.find(contactsInfo.docs[i].emailAddresses, { label: 'home' });
					if (_.isEmpty(email)) {
						if (contactsInfo.docs[i].emailAddresses.length > 0) {
							contactsInfo.docs[i].email = contactsInfo.docs[i].emailAddresses[0].email;
						} else {
							contactsInfo.docs[i].email = '';
						}
					} else {
						contactsInfo.docs[i].email = email.email;
					}
				}
			}
			contactsInfo.docs = _.sortBy(contactsInfo.docs, ['fullName']);
			this.setState({ showspinner: false });
			this.setState({ contactsList: dsContacts.cloneWithRows(contactsInfo.docs) });
		} else {
			this.setState({ showspinner: false });
			this.setState({ contactsList: dsContacts.cloneWithRows([]) });
		}
	}

	connectCompanyDb(isConnected) {
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			// this.checkSettings();
			this.getContacts('search');
		}
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	renderRowContacts(contact) {
		return (
			<ListItem button onPress={() => { Actions.ContactInfo({ contactid: contact._id, title: 'Contact info' }); }}>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
					}}
				>
					{contact.thumbnailPath === '' &&
						<Image
							style={{
								flex: 0.2,
								marginRight: 12,
								width: 80,
								height: 80,
								borderRadius: 80/2,
								borderWidth: 2,
								borderColor: 'steelblue',
								backgroundColor: 'transparent',
							}}
							source={require('../img/contacts.png')}>
						</Image>
					}
					{contact.thumbnailPath !== '' &&
						<Image
							style={{
								flex: 0.2,
								marginRight: 12,
								width: 80,
								height: 80,
								borderRadius: 80/2,
								borderWidth: 1,
								borderColor: 'steelblue',
								backgroundColor: 'transparent',
							}}
							source={{ uri: contact.thumbnailPath }}>
						</Image>
					}
					<View
						style={{
							flex: 0.7
						}}
					>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<Text note>Name: {contact.fullName}</Text>
						</View>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<Text note>Phone: {contact.telephone}</Text>
						</View>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<Text note>Email: {contact.email}</Text>
						</View>
					</View>
					<MaterialCommunityIcons
						name="chevron-right"
						style={{
							fontSize: 30,
							height: 40,
							top: 25,
							color: '#9b9cb1',
							position: 'absolute',
							right: 10,
						}}
					/>
				</View>
			</ListItem>
		);
	}

	clearFilter() {
		console.log('clear filter');
		this.setState({ filtervalue: '' });
		this.getContacts('filter');
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<View style={{ flexDirection: 'row', backgroundColor: '#EFEFEF', paddingLeft: 5, paddingTop: 5, paddingBottom: 5, alignItems: 'center' }}>
					<TextInput
						underlineColorAndroid={'transparent'}
						placeholder="Search contact by name"
						style={{
							flex: 1,
							height: 35,
							borderColor: '#C0C0C0',
							borderWidth: 1,
							borderRadius: 6,
							backgroundColor: '#fff',
							color: '#424B4F',
							paddingLeft: 5
						}}
						value={this.state.filtervalue}
						onChangeText={value => this.setState({ filtervalue: value })}
					/>
					<MaterialCommunityIcons
						right
						name="close-circle-outline"
						style={{
							fontSize: 30,
							color: '#9b9cb1',
							marginLeft: 15,
						}}
						onPress={() => { this.clearFilter(); }}
					/>
					<TouchableOpacity style={{ marginLeft: 15, marginRight: 15 }} onPress={() => { this.getContacts('search'); }}>
						<MaterialCommunityIcons name="magnify" size={28} style={{ color: '#808080' }} />
					</TouchableOpacity>
				</View>
				<Content>
					{this.state.showspinner && <Spinner /> }
					<ListView
						enableEmptySections
						dataSource={this.state.contactsList}
						renderRow={this.renderRowContacts}
					/>
					<View style={{ height: 60 }} />
				</Content>
				<ActionButton
					size={40}
					buttonColor="#9DBDF2"
					offsetX={10}
					offsetY={65}
					ref={(btn) => {
						this.floatingBtn = btn;
					}}
					onPress={() => { this.hideKeyboard(); }}
					icon={<IconMaterial name="settings" size={28} color="white" />}
				>
					<ActionButton.Item buttonColor="steelblue" title="Create contact" onPress={() => { this.createNewAppointment(); }}>
						<MaterialCommunityIcons name="plus" size={28} color="white" />
					</ActionButton.Item>
				</ActionButton>
				<ModalSide />
				<FooterMain activeArea="Contacts" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(Contacts);
