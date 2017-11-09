import React, { Component } from 'react';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import PouchDB from 'pouchdb-react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { ListView, Alert, AsyncStorage, Keyboard, View, Platform, ScrollView, Switch } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleProvider, Body, Container, Content, Header, Item, Input, Label, Title, Button, Text, Spinner } from 'native-base';
import TextField from '../containers/common/TextField';
import ModalPicker from './common/ModalPicker';
import styles from './common/ModalPickerStyle';
import { InfoRowStacked } from './common/InfoRowStacked';

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;
let DBAppointmentsConnection = null;

const hat = require('hat');

class UserProfile extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			showspinner: false,
			user: {
				doctype: 'user',
				email: '',
				name: '',
				alias: '',
				accessType: '',
				role: '',
				telephone: '',
				shareProfile: false,
			},
			userGlobalProfile: {
				doctype: 'userprofile',
				name: '',
				alias: '',
				telephone: '',
				userId: '',
			}
		};
		this.companyDatabase = '';
		this.AppointmentsDatabase = 'myappointments';
		this.userLoggedId = '';
		this.companyId = '';
		this.accessTypesList = [
			{
				key: '0',
				value: 'admin',
				label: 'Admin',
			},
			{
				key: '1',
				value: 'user',
				label: 'User',
			}
		];
	}

	componentWillMount() {
		AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
			if (userLoggedIdValue !== null) {
				this.userLoggedId = userLoggedIdValue;
			}
		});
		AsyncStorage.getItem('companyId').then((companyIdValue) => {
			if (companyIdValue !== null) {
				this.companyId = companyIdValue;
			}
		});
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				this.connectAppointmentsPouchDb(true);
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.goMenu) {
			Actions.pop({ refresh: { goMenu: true } });
		}
		if (nextProps.goBack) {
			this.connectAppointmentsPouchDb(true);
		}
	}

	onChangeText(newValue, prop) {
		const inuser = this.state.user;
		inuser[prop] = newValue;
		this.setState({ user: inuser });
	}

	onChangeGlobalProfileText(newValue, prop) {
		const inglobalProfile = this.state.userGlobalProfile;
		inglobalProfile[prop] = newValue;
		this.setState({ userGlobalProfile: inglobalProfile });
	}

	async saveProfile() {
		if (this.state.user.shareProfile === true) {
			this.state.userGlobalProfile.userId = this.state.user._id;
			this.state.userGlobalProfile.name = this.state.user.name;
			this.state.userGlobalProfile.alias = this.state.user.alias;
			this.state.userGlobalProfile.telephone = this.state.user.telephone;
			const updatedUserInfo = await DBCompanyConnection.post(this.state.user);
			const newUserInforev = updatedUserInfo.rev;
			if (this.state.userGlobalProfile._id) {
				const createdGlobalProfile = await DBAppointmentsConnection.put(this.state.userGlobalProfile);
				const newrevGlobalProfile = createdGlobalProfile.rev;
				this.onChangeGlobalProfileText(newrevGlobalProfile, '_rev');
				this.onChangeText(newUserInforev, '_rev');
			} else {
				const updatedGlobalProfile = await DBAppointmentsConnection.post(this.state.userGlobalProfile);
				const newrevGlobalProfile = updatedGlobalProfile.rev;
				this.onChangeGlobalProfileText(newrevGlobalProfile, '_rev');
				this.onChangeText(newUserInforev, '_rev');
			}
		} else {
			if (this.state.userGlobalProfile._id) {
				const globalProfileDeleted = await DBAppointmentsConnection.remove(this.state.userGlobalProfile);
			}
			this.state.userGlobalProfile.telephone = this.state.user.telephone;
			const updatedUserInfo = await DBCompanyConnection.post(this.state.user);
			const newUserInforev = updatedUserInfo.rev;
			this.onChangeText(newUserInforev, '_rev');
		}
		this.userProfileUpdatedAlert();
	}

	userProfileUpdatedAlert () {
		Alert.alert(
			'User profile updated',
			'The user profile for has been updated',
			[
				{ text: 'OK', onPress: () => console.log('profile updated'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async getProfileGlobalDB() {
		const queryRoles = { selector: { doctype: 'roles', }, };
		const rolesInfo = await DBCompanyConnection.find(queryRoles);
		if (rolesInfo.docs.length > 0) {
			this.rolesTypesList = [];
			const rolesListObject = {
				key: '0',
				value: 'chief',
				label: 'Chief'
			};
			this.rolesTypesList.push(rolesListObject);
			for (let e = 0; e < rolesInfo.docs.length; e += 1) {
				rolesListObject = {
					key: '',
					value: '',
					label: ''
				};
				rolesListObject.key = rolesInfo.docs[e]._rev;
				rolesListObject.value = rolesInfo.docs[e]._id;
				rolesListObject.label = rolesInfo.docs[e].title;
				this.rolesTypesList.push(rolesListObject);
			}
		} else {
			this.rolesTypesList = [
				{
					key: '0',
					value: 'chief',
					label: 'Chief',
				},
				{
					key: '1',
					value: 'employee',
					label: 'Employee',
				}
			];
		}
		const queryUserInfo = { selector: { doctype: 'user', _id: this.userLoggedId }, };
		const userInfo = await DBCompanyConnection.find(queryUserInfo);
		this.userInfo = '';
		if (userInfo.docs.length > 0) {
			for (let u = 0; u < userInfo.docs.length; u += 1) {
				for (let a = 0; a < this.accessTypesList.length; a += 1) {
					if (this.accessTypesList[a].value === userInfo.docs[u].accessType) {
						userInfo.docs[u].accessTypeLabel = this.accessTypesList[a].label;
					}
				}
				for (let r = 0; r < this.rolesTypesList.length; r += 1) {
					if (this.rolesTypesList[r].value === userInfo.docs[u].role) {
						userInfo.docs[u].roleLabel = this.rolesTypesList[r].label;
					}
				}
				this.userInfo = userInfo.docs[u];
			}
		}
		const querySharedProfile = { selector: { doctype: 'userprofile', userId: this.userLoggedId }, };
		const userSharedProfile = await DBAppointmentsConnection.find(querySharedProfile);
		if (userSharedProfile.docs.length > 0) {
			for (let up = 0; up < userSharedProfile.docs.length; up += 1) {
				this.userInfo.name = userSharedProfile.docs[up].name;
				this.userInfo.alias = userSharedProfile.docs[up].alias;
				this.userInfo.telephone = userSharedProfile.docs[up].telephone;
				this.setState({ user: this.userInfo, userGlobalProfile: userSharedProfile.docs[up], showspinner: false });
			}
		} else {
			this.setState({ user: this.userInfo, showspinner: false });
		}
	}

	connectAppointmentsPouchDb() {
		this.setState({ showspinner: true });
		const setsyncURL = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.AppointmentsDatabase.toLowerCase()}`;
		DBAppointmentsConnection = new PouchDB(setsyncURL);
		this.AppointmentsDBConnected = true;
		this.connectCompanyDb(true);
	}

	connectCompanyDb() {
		const setsyncURL = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(setsyncURL);
		this.companyDBConnected = true;
		this.getProfileGlobalDB();
	}

	renderButtons() {
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
				<ActionButton.Item buttonColor="#8fbc8f" title="Update profile" onPress={() => { this.saveProfile(); }}>
					<IconMaterial name="save" size={28} color="white" />
				</ActionButton.Item>
			</ActionButton>
		);
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Content>
					{this.state.showspinner && <Spinner /> }
					<View style={{ padding: 20 }}>
						<TextField label="Name" value={this.state.user.name} onChangeText={value => this.onChangeText(value, 'name')} />
						<TextField label="Alias" value={this.state.user.alias} onChangeText={value => this.onChangeText(value, 'alias')} />
						<InfoRowStacked label="Access type" value={this.state.user.accessTypeLabel} />
						<InfoRowStacked label="Role" value={this.state.user.roleLabel} />
						<TextField label="Telephone" value={this.state.user.telephone} onChangeText={value => this.onChangeText(value, 'telephone')} />
						<InfoRowStacked label="Email" value={this.state.user.email} />
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
							}}
						>
							<Label
								style={{
									paddingTop: 15,
									flex: 0.8
								}}
							>Share user profile</Label>
								<Switch
									style={{
										flex: 0.2,
										marginTop: 10,
										marginBottom: 10,
									}}
									onValueChange={(value) => {
										this.onChangeText(value, 'shareProfile');
									}}
									value={this.state.user.shareProfile}
								/>
						</View>
					</View>
					<View style={{ height: 40 }} />
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
)(UserProfile);
