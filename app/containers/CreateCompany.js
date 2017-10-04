import React, { Component } from 'react';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import PouchDB from 'pouchdb-react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { ListView, Alert, AsyncStorage, Keyboard, View } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleProvider, Body, Container, Content, Header, Item, Input, Label, Title, Button, Text } from 'native-base';

// import Style from '../styles/styles';

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;
let DBAppointmentsConnection = null;

const hat = require('hat');

class CreateCompany extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			companyid: this.props.companyid,
			dataSource: ds.cloneWithRows([]),
			user: {
				doctype: 'user',
				email: '',
				name: '',
				alias: '',
				accessType: 'admin',
				role: 'chief',
				telephone: ''
			},
			company: {
				doctype: 'company',
				name: '',
				companyRegNo: '',
				vatNo: '',
				phone: '',
				email: '',
				address: '',
				country: '',
				userEmail: '',
				databaseId: '',
			},
			invites: {
				doctype: 'invites',
				databaseId: '',
				companyId: '',
				memberStatus: 'member',
				userEmail: ''
			}
		};
		this.companyDatabase = '';
		this.AppointmentsDatabase = 'myappointments';
		this.userLoggedEmail = '';
	}

	componentWillMount() {
		AsyncStorage.getItem('userLoggedEmail').then((userLoggedEmailValue) => {
			if (userLoggedEmailValue !== null) {
				this.userLoggedEmail = userLoggedEmailValue;

				let invalue = this.state.user;
				let prop = 'email';
				_.set(invalue, prop, this.userLoggedEmail);
				this.setState({ user: invalue });

				invalue = this.state.invites;
				prop = 'userEmail';
				_.set(invalue, prop, this.userLoggedEmail);
				this.setState({ invites: invalue });

				invalue = this.state.company;
				prop = 'userEmail';
				_.set(invalue, prop, this.userLoggedEmail);
				this.setState({ company: invalue });
			}
		});
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
			} else {
				const newHatId = hat();
				this.companyDatabase = `app${newHatId}`;
			}
			let invalue = this.state.user;
			let prop = 'databaseId';
			_.set(invalue, prop, this.companyDatabase);
			this.setState({ user: invalue });

			invalue = this.state.invites;
			prop = 'databaseId';
			_.set(invalue, prop, this.companyDatabase);
			this.setState({ invites: invalue });

			invalue = this.state.company;
			prop = 'databaseId';
			_.set(invalue, prop, this.companyDatabase);
			this.setState({ company: invalue });
			this.connectCompanyDb(true);
		});
		this.connectAppointmentsPouchDb(true);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.goMenu) {
			Actions.pop({ refresh: { goMenu: true } });
		}
		if (nextProps.goBack) {
			this.connectAppointmentsPouchDb(true);
			this.connectCompanyDb(true);
		}
	}

	onChangeText(newValue, prop) {
		const incompany = this.state.company;
		incompany[prop] = newValue;
		this.setState({ company: incompany });
	}

	async getCompanyInfo() {
		const query = { selector: { doctype: 'company', _id: this.state.companyid }, };
		const companyInfo = await DBAppointmentsConnection.find(query);
		if (companyInfo.docs.length > 0) {
			this.setState({ company: companyInfo.docs[0] });
		}
	}

	connectAppointmentsPouchDb() {
		const setsyncURL = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.AppointmentsDatabase.toLowerCase()}`;
		DBAppointmentsConnection = new PouchDB(setsyncURL);
		this.AppointmentsDBConnected = true;
		this.getCompanyInfo();
	}

	async checkIfCompanyExists() {
		console.log('this.companyDatabasethis.companyDatabasethis.companyDatabase');
		console.log(this.companyDatabase);
		const query = { selector: { doctype: 'company', databaseId: this.companyDatabase, companyName: this.state.company.name }, };
		const companyExists = await DBAppointmentsConnection.find(query);
		if (companyExists.docs.length > 0) {
			Alert.alert(
				'Create Company',
				`The company ${this.state.company.name} already exists`,
				[
					{ text: 'Change name', onPress: () => console.log('change name pressed'), style: 'cancel' },
					{ text: 'OK', onPress: () => Actions.company({ title: 'Company list' }), style: 'cancel' },
				],
				{ cancelable: true }
			);
		} else {
			this.checkIfUserExists();
			this.createCompanyConfirmation();
		}
	}

	connectCompanyDb() {
		const setsyncURL = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(setsyncURL);
		this.companyDBConnected = true;
	}

	async checkIfUserExists() {
		const query = { selector: { doctype: 'user', email: this.userLoggedEmail }, };
		const userExists = await DBCompanyConnection.find(query);
		if (userExists.docs.length === 0) {
			DBCompanyConnection.post(this.state.user);
		}
	}

	createCompanyConfirmation() {
		console.log('this.state.companythis.state.companythis.state.companythis.state.company');
		console.log(this.state.company);
		Alert.alert(
			'Create a new company',
			`Are you sure you want to create the company ${this.state.company.name}?`,
			[
				{ text: 'Yes', onPress: () => this.createCompany(), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
			],
			{ cancelable: false }
		);
	}

	async createCompany() {
		Keyboard.dismiss();
		if (this.state.companyid === '') {
			this.setState({ company: this.state.company });
			const newCompany = await DBAppointmentsConnection.post(this.state.company);
			const newrev = newCompany.rev;
			this.onChangeText(newrev, '_rev');
			this.state.invites.databaseId = this.companyDatabase;
			this.state.invites.companyId = newCompany.id;
			this.setState({ invites: this.state.invites });
			DBAppointmentsConnection.post(this.state.invites);
			Alert.alert(
				'Company created',
				`The company ${this.state.company.name} has been created`,
				[
					{ text: 'OK', onPress: () => Actions.company({ title: 'Company list' }), style: 'cancel' }
				],
				{ cancelable: true }
			);
		} else {
			const savedCompany = await DBAppointmentsConnection.put(this.state.company);
			const newrev = savedCompany._rev;
			this.onChangeText(newrev, '_rev');
			Alert.alert(
				'Company saved',
				`The company ${this.state.company.name} has been saved`,
				[
					{ text: 'OK', onPress: () => Actions.company({ title: 'Company list' }), style: 'cancel' }
				],
				{ cancelable: true }
			);
		}
	}

	renderButtons() {
		if (this.state.companyid === '') {
			return (
				<ActionButton
					size={40}
					buttonColor="#9DBDF2"
					offsetX={10}
					offsetY={10}
					ref={(btn) => {
						this.floatingBtn = btn;
					}}
					onPress={() => { Keyboard.dismiss(); }}
					icon={<IconMaterial name="settings" size={28} color="white" />}
				>
					<ActionButton.Item buttonColor="#00b359" title="Create company" onPress={() => { this.checkIfCompanyExists(); }}>
						<IconMaterial name="save" size={28} color="white" />
					</ActionButton.Item>
				</ActionButton>
			);
		}
		return (
			<ActionButton
				size={40}
				buttonColor="#9DBDF2"
				offsetX={10}
				offsetY={10}
				ref={(btn) => {
					this.floatingBtn = btn;
				}}
				onPress={() => { Keyboard.dismiss(); }}
				icon={<IconMaterial name="settings" size={28} color="white" />}
			>
				<ActionButton.Item buttonColor="#00b359" title="Save company" onPress={() => { this.createCompany(); }}>
					<IconMaterial name="save" size={28} color="white" />
				</ActionButton.Item>
				<ActionButton.Item buttonColor="#ff4c4c" title="Delete company" onPress={() => { this.deleteCompany(); }}>
					<IconMaterial name="delete" size={28} color="white" />
				</ActionButton.Item>
			</ActionButton>
		);
	}

	render() {
		return (
			<Container>
				<Header style={{ backgroundColor: '#9DBDF2' }}>
					<Body>
					<Title style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
					Create Company
					</Title>
					</Body>
				</Header>
				<Content>
					<Item stackedLabel>
						<Label style={{ marginLeft: 12 }}>Company name</Label>
							<Input
							style={{ marginLeft: 7 }}
							onChangeText={(text) => {
								this.onChangeText(text, 'name');
							}}
							value={this.state.company.name}
							/>
					</Item>
					<Item stackedLabel>
						<Label style={{ marginLeft: 12 }}>Company Reg No</Label>
							<Input
							style={{ marginLeft: 7 }}
							onChangeText={(text) => {
								this.onChangeText(text, 'companyRegNo');
							}}
							value={this.state.company.companyRegNo}
							/>
					</Item>
					<Item stackedLabel>
						<Label style={{ marginLeft: 12 }}>VAT No</Label>
							<Input
							style={{ marginLeft: 7 }}
							onChangeText={(text) => {
								this.onChangeText(text, 'vatNo');
							}}
							value={this.state.company.vatNo}
							/>
					</Item>
					<Item stackedLabel>
						<Label style={{ marginLeft: 12 }}>Contact Phone</Label>
							<Input
							style={{ marginLeft: 7 }}
							onChangeText={(text) => {
								this.onChangeText(text, 'phone');
							}}
							value={this.state.company.phone}
							/>
					</Item>
					<Item stackedLabel>
						<Label style={{ marginLeft: 12 }}>Contact Email</Label>
							<Input
							style={{ marginLeft: 7 }}
							onChangeText={(text) => {
								this.onChangeText(text, 'email');
							}}
							value={this.state.company.email}
							/>
					</Item>
					<Item stackedLabel>
						<Label style={{ marginLeft: 12 }}>Address</Label>
						<Input
							multiline
							numberOfLines={5}
							style={{
								height: 80,
								paddingVertical: 0,
								marginLeft: 7
							}}
							value={this.state.company.address}
							onChangeText={(text) => {
								this.onChangeText(text, 'address');
							}}
						/>
					</Item>
					<Item stackedLabel>
						<Label style={{ marginLeft: 12 }}>Country</Label>
							<Input
							style={{ marginLeft: 7 }}
							onChangeText={(text) => {
								this.onChangeText(text, 'country');
							}}
							value={this.state.company.country}
							/>
					</Item>
					<View style={{ height: 60 }} />
				</Content>
				{this.renderButtons()}
			</Container>
		);
	}
}

export default connect(
	(state) => {
		return state;
	},
	(dispatch) => {
		return {
			dispatch
		};
	}
)(CreateCompany);