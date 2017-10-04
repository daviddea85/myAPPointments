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
	}

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

	onChangeText(newValue, prop) {
		const incontact = this.state.contactinfo;
		incontact[prop] = newValue;
		this.setState({ contactinfo: incontact });
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Content style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10 }}>
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
