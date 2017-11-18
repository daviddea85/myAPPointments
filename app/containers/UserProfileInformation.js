import React, { Component } from 'react';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import PouchDB from 'pouchdb-react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { ListView, Alert, AsyncStorage, Keyboard, View, Platform, ScrollView, Switch, Dimensions } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleProvider, Body, Container, Content, Header, Item, Input, Label, Title, Button, Text, Spinner } from 'native-base';
import { FooterMain } from '../containers/common';
import TextField from '../containers/common/TextField';
import ModalPicker from './common/ModalPicker';
import styles from './common/ModalPickerStyle';
import { InfoRowStacked } from './common/InfoRowStacked';

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;
let DBAppointmentsConnection = null;

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

const hat = require('hat');

class UserProfile extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			showspinner: false,
			showspinnertext: 'Loading user information, please wait',
			newuser: this.props.newuser || false,
			area: this.props.area || '',
			userid: this.props.userid || '',
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
			},
			invite: {
				doctype: 'invites',
				databaseId: '',
				companyId: '',
				inviteStatus: '',
				userEmail: '',
			}
		};
		this.companyDatabase = '';
		this.AppointmentsDatabase = 'myappointments';
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
		if (prop === 'accessType') {
			const inuser = this.state.user;
			inuser['accessType'] = newValue.value;
			inuser['accessTypeLabel'] = newValue.label;
			this.setState({ user: inuser });
		} else if (prop === 'role') {
			const inuser = this.state.user;
			inuser['role'] = newValue.value;
			inuser['roleLabel'] = newValue.label;
			this.setState({ user: inuser });
		} else {
			const inuser = this.state.user;
			inuser[prop] = newValue;
			this.setState({ user: inuser });
		}
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
				const updatedGlobalProfile = await DBAppointmentsConnection.put(this.state.userGlobalProfile);
				const newrevGlobalProfile = updatedGlobalProfile.rev;
				this.onChangeGlobalProfileText(newrevGlobalProfile, '_rev');
				this.onChangeText(newUserInforev, '_rev');
			} else {
				const createdGlobalProfile = await DBAppointmentsConnection.post(this.state.userGlobalProfile);
				const newrevGlobalProfile = createdGlobalProfile.rev;
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

	async saveUser(action) {
		this.hideKeyboard();
		if (_.isEmpty(this.state.user.email)) {
			Alert.alert(
				'Validation failed',
				'User cannot be saved without a valid email',
				[
					{ text: 'OK', onPress: () => console.log('user created/updated') },
				],
				{ cancelable: true }
			);
		} else {
			this.state.user.email = this.state.user.email.toLowerCase();
			if (action === 'updated') {
				const updatedUser = await DBCompanyConnection.put(this.state.user);
				const newrevUser = updatedUser.rev;
				this.onChangeText(newrevUser, '_rev');
			} else {
				const createdUser = await DBCompanyConnection.post(this.state.user);
				const newrevUser = createdUser.rev;
				this.onChangeText(newrevUser, '_rev');
			}
			this.saveUserAlert(action);
		}
	}

	async saveUserAlert(actionText) {
		if (actionText === 'created') {
			this.setState({ newuser: false });
		}
		Alert.alert(
			`User ${actionText}`,
			`The user ${this.state.user.email} has been ${actionText}`,
			[
				{ text: 'OK', onPress: () => console.log('user created/updated') },
			],
			{ cancelable: true }
		);
	}

	async deleteUserConfirmationAlert() {
		Alert.alert(
			'Delete user',
			`Are you sure you want to delete the user ${this.state.user.email}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteUser(), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel user delete'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async deleteUser() {
		if (this.state.invite._id) {
			const inviteDeleted = await DBAppointmentsConnection.remove(this.state.invite);
		}
		if (this.state.userGlobalProfile._id) {
			const userGlobalProfileDeleted = await DBAppointmentsConnection.remove(this.state.userGlobalProfile);
		}
		const userDeleted = await DBCompanyConnection.remove(this.state.user);
		this.deleteUserAlert();
	}

	async deleteUserAlert() {
		Alert.alert(
			'User deleted',
			'The user has been deleted',
			[
				{ text: 'OK', onPress: () => Actions.pop({ refresh: { goBack: true } }) },
			],
			{ cancelable: true }
		);
	}

	async sendInvite() {
		if (this.state.invite._id) {
			Alert.alert(
				'User invite',
				'The user has been already invited',
				[
					{ text: 'OK', onPress: () => console.log('user already invited') },
				],
				{ cancelable: true }
			);
		} else {
			const newCompanyInvite = {};
			newCompanyInvite.doctype = 'invites';
			newCompanyInvite.databaseId = this.companyDatabase;
			newCompanyInvite.companyId = this.companyId;
			newCompanyInvite.inviteStatus = 'pending';
			newCompanyInvite.userEmail = `${this.state.user.email}`.toLowerCase();
			const inviteSent = await DBAppointmentsConnection.post(newCompanyInvite);
			newid = inviteSent.id;
			prop = '_id';
			const ininvite = this.state.invite;
			ininvite[prop] = newid;
			this.setState({ invite: ininvite });
			Alert.alert(
				'User invitation',
				`Invite to ${newCompanyInvite.userEmail} has been sent`,
				[
					{ text: 'OK', onPress: () => console.log('invite sent') },
				],
				{ cancelable: true }
			);
		}
	}

	async getProfileGlobalDB() {
		const queryRoles = { selector: { doctype: 'role', }, };
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
		const queryUserInfo = { selector: { doctype: 'user', _id: this.state.userid }, };
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
		} else {
			this.userInfo = this.state.user;
		}
		const queryInvite = { selector: { doctype: 'invites', userEmail: this.userInfo.email }, };
		const userInvite = await DBAppointmentsConnection.find(queryInvite);
		if (userInvite.docs.length > 0) {
			for (let i = 0; i < userInvite.docs.length; i += 1) {
				this.setState({ invite: userInvite.docs[i] });
			}
		} else {
			this.setState({ invite: this.state.invite });
		}
		const querySharedProfile = { selector: { doctype: 'userprofile', userId: this.state.userid }, };
		const userSharedProfile = await DBAppointmentsConnection.find(querySharedProfile);
		if (userSharedProfile.docs.length > 0) {
			for (let up = 0; up < userSharedProfile.docs.length; up += 1) {
				this.userInfo.name = userSharedProfile.docs[up].name;
				this.userInfo.alias = userSharedProfile.docs[up].alias;
				this.userInfo.telephone = userSharedProfile.docs[up].telephone;
				this.setState({ user: this.userInfo, userGlobalProfile: userSharedProfile.docs[up], showspinner: false });
			}
		} else {
			this.setState({ user: this.userInfo, userGlobalProfile: this.state.userGlobalProfile, showspinner: false });
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

	hideKeyboard() {
		Keyboard.dismiss();
	}

	renderButtonsProfile() {
		if (this.state.area === 'profile') {
			return (
				<ActionButton
					size={40}
					buttonColor="#9DBDF2"
					offsetX={10}
					offsetY={65}
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
		return (null);
	}

	renderButtonsUsersManagement() {
		if (this.state.area === 'management') {
			if (this.state.newuser === true) {
				return (
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
						<ActionButton.Item buttonColor="#8fbc8f" title="Save user" >
							<IconMaterial name="save" size={28} color="white" onPress={() => { this.saveUser('created'); }} />
						</ActionButton.Item>
					</ActionButton>
				);
			}
			return (
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
					<ActionButton.Item buttonColor="#8fbc8f" title="Update user" onPress={() => { this.saveUser('updated'); }} >
						<IconMaterial name="save" size={28} color="white" />
					</ActionButton.Item>
					<ActionButton.Item buttonColor="steelblue" title="Send invite" onPress={() => { this.sendInvite(); }} >
						<IconMaterial name="email" size={28} color="white" />
					</ActionButton.Item>
					<ActionButton.Item buttonColor="#f08080" title="Delete user" onPress={() => { this.deleteUserConfirmationAlert(); }} >
						<IconMaterial name="delete" size={28} color="white" />
					</ActionButton.Item>
				</ActionButton>
			);
		}
		return (null);
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Content>
					{this.state.showspinner &&
						<View
							style={{
								backgroundColor: 'white',
								justifyContent: 'center',
								marginTop: fullHeight / 4,
							}}
						>
							<Spinner />
							<Text
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									alignSelf: 'center',
									fontWeight: 'bold'
								}}
							>{this.state.showspinnertext}</Text>
						</View>
					}
					{this.state.area === 'profile' && this.state.showspinner === false &&
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
					}
					{this.state.area === 'management' && this.state.showspinner === false &&
						<View style={{ padding: 20 }}>
							{this.state.newuser === true &&
								<TextField label="Name" value={this.state.user.name} onChangeText={value => this.onChangeText(value, 'name')} />
							}
							{this.state.newuser === true &&
								<TextField label="Alias" value={this.state.user.alias} onChangeText={value => this.onChangeText(value, 'alias')} />
							}
							{this.state.newuser === false &&
								<InfoRowStacked label="Name" value={this.state.user.name} />
							}
							{this.state.newuser === false &&
								<InfoRowStacked label="Alias" value={this.state.user.alias} />
							}
							<ModalPicker data={this.accessTypesList} label="Access type" initValue={this.state.user.accessTypeLabel} onChange={(option)=>{ this.onChangeText(option, 'accessType'); }} />
							<ModalPicker data={this.rolesTypesList} label="Role" initValue={this.state.user.roleLabel} onChange={(option)=>{ this.onChangeText(option, 'role'); }} />
							{this.state.newuser === true &&
								<TextField label="Telephone" value={this.state.user.telephone} onChangeText={value => this.onChangeText(value, 'telephone')} />	
							}
							<TextField label="Email" value={this.state.user.email} onChangeText={value => this.onChangeText(value, 'email')} validate />
							{this.state.newuser === false &&
								<InfoRowStacked label="Telephone" value={this.state.user.telephone} />
							}
						</View>
					}
					<View style={{ height: 60 }} />
				</Content>
					{this.renderButtonsProfile()}
					{this.renderButtonsUsersManagement()}
				<FooterMain activeArea="More" />
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
