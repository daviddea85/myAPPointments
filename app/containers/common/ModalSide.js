import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import { Platform, Dimensions, Alert, AsyncStorage, View, Keyboard, Modal, Switch, TextInput } from 'react-native';
import PouchDB from 'pouchdb-react-native';
import {
	Container,
	Content,
	Header,
	Left,
	Right,
	Body,
	Title,
	Tab,
	Tabs,
	Form,
	Item,
	Input,
	Label,
	TabHeading,
	Icon,
	Button,
	Text,
	Picker,
	Spinner
} from 'native-base';
import _ from 'lodash';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const ContactsDevice = require('react-native-contacts');
import { styles } from '../../Styles/general';

import { modalState, setModalState } from '../../lib/Utilities';

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

PouchDB.plugin(require('pouchdb-find'));
let DBCompanyConnection = null;

class ModalSide extends Component {

	constructor(props) {
		super(props);
		this.state = {
			showspinner: false,
			showspinnertext: '',
			settings: {
				_id: '',
				doctype: 'settings',
				importcontacts: false,
				shareimportedcontacts: false,
				sendrecallnotifications: false,
				sendrecalleverymonthsnumber: '',
				remindersameday: false,
				reminderdaysbefore: '',
				notificationsmethodemail: false,
				notifificationsmethodsms: false,
				systemalerts: false,
				useralerts: false,
				userid: '',
				shareimportedcontacts: false,
				sharecreatedcontacts: false
			},
		};
		this.companyDatabase = '';
	}

	componentWillMount() {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {
						if (this.state.settings.userid === '') {
							const insettings = this.state.settings;
							insettings['userid'] = userLoggedIdValue;
							this.setState({ settings: insettings });
						}
						this.connectCompanyDb(true);
					}
				});
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {
						if (this.state.settings.userid === '') {
							const insettings = this.state.settings;
							insettings['userid'] = userLoggedIdValue;
							this.setState({ settings: insettings });
						}
						this.connectCompanyDb(true);
					}
				});
			}
		});
	}

	onChangeText(newValue, prop) {
		if (prop === 'importcontacts') {
			if (newValue === true) {
				this.getContactsFromDevice(prop, newValue);
			} else {
				const insettings = this.state.settings;
				insettings[prop] = newValue;
				insettings['shareimportedcontacts'] = false;
				insettings['sharecreatedcontacts'] = false;
				this.setState({ settings: insettings });
				this.deleteContactsFromDB();
			}
		} else if (prop === 'shareimportedcontacts') {
			if (newValue === true) {
				this.getContactsFromDevice(prop, newValue);
			} else {
				const insettings = this.state.settings;
				insettings[prop] = newValue;
				this.setState({ settings: insettings });
				this.getContactsFromDevice(prop);
			}
		} else if (prop === 'sharecreatedcontacts') {
			if (newValue === true) {
				this.getContactsFromDevice(prop, newValue);
			} else {
				const insettings = this.state.settings;
				insettings[prop] = newValue;
				this.setState({ settings: insettings });
				this.getContactsFromDevice(prop, newValue);
			}
		} else {
			const insettings = this.state.settings;
			insettings[prop] = newValue;
			this.setState({ settings: insettings });
			this.saveSettings();
		}
	}

	async saveSettings() {
		if (this.state.settings._id !== '') {
			const savedSettings = await DBCompanyConnection.put(this.state.settings);
			newrev = savedSettings.rev;
			const insettings = this.state.settings;
			insettings['_rev'] = savedSettings.rev;
			this.setState({ settings: insettings });
		} else {
			const settings = {
				doctype: 'settings',
				importcontacts: this.state.settings.importcontacts,
				sendrecallnotifications: this.state.settings.sendrecallnotifications,
				sendrecalleverymonthsnumber: this.state.settings.sendrecalleverymonthsnumber,
				remindersameday: this.state.settings.remindersameday,
				reminderdaysbefore: this.state.settings.reminderdaysbefore,
				notificationsmethodemail: this.state.settings.notificationsmethodemail,
				notifificationsmethodsms: this.state.settings.notifificationsmethodsms,
				systemalerts: this.state.settings.systemalerts,
				useralerts: this.state.settings.useralerts,
				userid: this.state.settings.userid,
				shareimportedcontacts: this.state.settings.shareimportedcontacts,
				sharecreatedcontacts: this.state.settings.sharecreatedcontacts
			};
			const newSettings = await DBCompanyConnection.post(settings);
			newrev = newSettings.rev;
			const insettings = settings;
			insettings['_rev'] = newSettings.rev;
			insettings['_id'] = newSettings.id;
			this.setState({ settings: insettings });
		}
	}

	async getSettingsInfo() {
		const query = { selector: { doctype: 'settings', userid: this.state.settings.userid }, };
		const settings = await DBCompanyConnection.find(query);
		if (settings.docs.length > 0) {
			this.setState({ settings: settings.docs[0] });
		}
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	connectCompanyDb(isConnected) {
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getSettingsInfo();
		}
	}

	goToSignOutConfirmation() {
		Alert.alert(
			'Sign out',
			'Are you sure you want to sign out?',
			[
				{ text: 'Yes', onPress: () => this.goToSignOut(), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('Cancelled sign out'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	goToSignOut() {
		try {
			AsyncStorage.setItem('userLoggedId', '');
			AsyncStorage.setItem('accessType', '');
			AsyncStorage.setItem('companyDatabase', '');
			AsyncStorage.setItem('userLoggedEmail', '');
			AsyncStorage.setItem('companyId', '');
			AsyncStorage.setItem('companyName', '');
			firebase.auth().signOut();
			this.props.setModalState({ prop: 'modalConfigShow', value: false });
			Actions.Login();
		} catch (error) {
			Alert.alert(
				error.code,
				error.message,
				[
					{ text: 'OK', onPress: () => console.log('OK Pressed') },
				],
				{ cancelable: false }
			);
		}
	}

	async deleteContactsFromDB() {
		const queryContact = { selector: { doctype: 'contact', 'imported': true, 'userid': this.state.settings.userid }, };
		const contactinfo = await DBCompanyConnection.find(queryContact);
		if (contactinfo.docs.length > 0) {
			for (let i = 0; i < contactinfo.docs.length; i += 1) {
				this.setState({ showspinner: true, showspinnertext: 'Removing contacts, please wait' });
				const contactdeleted = await DBCompanyConnection.remove(contactinfo.docs[i]);
			}
			this.setState({ showspinner: false });
		} else {
			this.setState({ showspinner: false });
		}
		this.saveSettings();
	}

	async updateDBContacts(contacts) {
		this.saveSettings();
		this.setState({ showspinner: true, showspinnertext: 'Updating contacts, please wait' });
		if (this.state.settings.importcontacts === true) {
			this.queryContact = { selector: { doctype: 'contact', 'imported': true, 'userid': this.state.settings.userid }, };
			const contactsdb = await DBCompanyConnection.find(this.queryContact);
			if (contactsdb.docs.length > 0) {
				for (let i = 0; i < contacts.length; i += 1) {
					let contactfound = _.find(contactsdb.docs, { recordID : contacts[i].recordID });
					if (!_.isEmpty(contactfound)) {
						contactfound.company = contacts[i].company;
						contactfound.emailAddresses = contacts[i].emailAddresses;
						contactfound.familyName = contacts[i].familyName;
						contactfound.givenName = contacts[i].givenName;
						contactfound.hasThumbnail = contacts[i].hasThumbnail;
						contactfound.jobTitle = contacts[i].jobTitle;
						contactfound.phoneNumbers = contacts[i].phoneNumbers;
						contactfound.postalAddresses = contacts[i].postalAddresses;
						contactfound.thumbnailPath = contacts[i].thumbnailPath;
						if (this.state.settings.shareimportedcontacts === true) {
							contactfound.shareimportedcontacts = true;
						} else {
							contactfound.shareimportedcontacts = false;
						}
						if (this.state.settings.sharecreatedcontacts === true) {
							contactfound.sharecreatedcontacts = true;
						} else {
							contactfound.sharecreatedcontacts = false;
						}
						const savedcontact = await DBCompanyConnection.put(contactfound);
					} else {
						contacts[i].doctype = 'contact';
						contacts[i].imported = true;
						contacts[i].shareimportedcontacts = false;
						contacts[i].sharecreatedcontacts = false;
						contacts[i].userid = this.state.settings.userid;
						const newcontact = await DBCompanyConnection.post(contacts[i]);
					}
				}
				this.setState({ showspinner: false });
			} else {
				for (let i = 0; i < contacts.length; i += 1) {
					this.setState({ showspinner: true });
					contacts[i].doctype = 'contact';
					contacts[i].imported = true;
					contacts[i].shareimportedcontacts = false;
					contacts[i].sharecreatedcontacts = false;
					contacts[i].userid = this.state.settings.userid;
					await DBCompanyConnection.post(contacts[i]);
				}
				this.setState({ showspinner: false });
			}
		} else {
			Alert.alert(
				'Alert',
				'myAPPointments needs permission to import contacts from phone before you refresh the contacts',
				[
					{ text: 'OK', onPress: () => console.log('OK Pressed') },
				],
				{ cancelable: false }
			);
		}
	}

	permissionGetContactsDenied() {
		this.setState({ showspinner: false });
		newValue = false;
		prop = 'importcontacts';
		const insettings = this.state.settings;
		insettings[prop] = newValue;
		this.setState({ settings: insettings });
		this.saveSettings();
	}
	

	getContactsFromDevice(prop, newValue) {
		ContactsDevice.getAll((error, contacts) => {
			if(error === 'denied'){
				Alert.alert(
					'Access denied',
					'Please allow access to your contact list if you want to import contacts from your settings phone area',
					[
						{ text: 'OK', onPress: () => this.permissionGetContactsDenied() },
					],
					{ cancelable: false }
				);
			} else {
				const insettings = this.state.settings;
				insettings[prop] = newValue;
				this.setState({ settings: insettings });
				this.updateDBContacts(contacts);
			}
		});
	}

	render() {
		return (
			<View>
				<Modal transparent={false} visible={this.props.ModalState.modalConfigShow} onRequestClose={() => { console.log('settings closed'); }} >
					<Header>
						<Left>
							{!this.state.showspinner &&
								<Button transparent onPress={() => { this.props.setModalState({ prop: 'modalConfigShow', value: false }); }}>
									<MaterialCommunityIcons size={32} name='chevron-left' />
								</Button>
							}
						</Left>
						<Body style={{ backgroundColor: 'transparent' }}>
							<Title style={{ fontWeight: 'normal' }}>Settings</Title>
						</Body>
						<Right />
					</Header>
					{this.state.showspinner &&
						<View
							style={{
								backgroundColor: 'white',
								justifyContent: 'center',
								marginTop: fullHeight / 3,
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
					{this.state.showspinner === false &&
						<KeyboardAwareScrollView>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 1,
										fontWeight: 'bold'
									}}
								>Contacts</Label>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Import contacts from phone</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10,
											marginBottom: 10,
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'importcontacts');
										}}
										value={this.state.settings.importcontacts}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Refresh contacts from phone</Label>
								<Button
									style={{
										marginRight: 10
									}}
									transparent
									onPress={() => { this.getContactsFromDevice(); }}
								>
									<Icon name="md-sync" size={22}/>
								</Button>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Share imported contacts</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10,
											marginBottom: 10,
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'shareimportedcontacts');
										}}
										value={this.state.settings.shareimportedcontacts}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Share created contacts</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10,
											marginBottom: 10,
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'sharecreatedcontacts');
										}}
										value={this.state.settings.sharecreatedcontacts}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8,
										fontWeight: 'bold'
									}}
								>Recall notifications</Label>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8 }}
									>Send recall notifications</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'sendrecallnotifications');
										}}
										value={this.state.settings.sendrecallnotifications}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Send every * months</Label>
								<TextInput
									keyboardType="numeric"
									underlineColorAndroid={'transparent'}
									autoCorrect={false}
									maxLength={2}
									paddingLeft={10}
									style={{
										height: 38,
										flex: 0.1,
										borderColor: '#C0C0C0',
										borderWidth: 1,
										borderRadius: 6,
										backgroundColor: '#fff',
										color: '#424B4F',
										marginRight: 20,
										marginTop: 10,
										marginBottom: 10,
									}}
									returnKeyType="done"
									onChangeText={(text) => {
										this.onChangeText(text, 'sendrecalleverymonthsnumber');
									}}
									value={this.state.settings.sendrecalleverymonthsnumber}
								/>
							</View>
							{/* {this.state.showspinner &&
								<View
									style={{
										marginRight: 15,
										marginLeft: 15,
									}}
								>
								<Spinner />
								</View>
							} */}
							{/* {this.state.showimporting &&
								<Text
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										alignSelf: 'center',
										fontWeight: 'bold'
									}}
								>Importing contacts, please wait</Text>
							}
							{this.state.showremoving &&
								<Text
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										alignSelf: 'center',
										fontWeight: 'bold'
									}}
								>Removing contacts, please wait</Text>
							}
							{this.state.showrefreshing &&
								<Text
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										alignSelf: 'center',
										fontWeight: 'bold'
									}}
								>Refreshing contacts, please wait</Text>
							} */}
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 1,
										fontWeight: 'bold'
									}}
								>Send reminder notifications</Label>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8 }}
									>Reminder same day</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'remindersameday');
										}}
										value={this.state.settings.remindersameday}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Reminder days before</Label>
								<TextInput
									keyboardType="numeric"
									underlineColorAndroid={'transparent'}
									autoCorrect={false}
									maxLength={2}
									paddingLeft={10}
									style={{
										height: 38,
										flex: 0.1,
										borderColor: '#C0C0C0',
										borderWidth: 1,
										borderRadius: 6,
										backgroundColor: '#fff',
										color: '#424B4F',
										marginRight: 20,
										marginTop: 10,
										marginBottom: 10,
									}}
									returnKeyType="done"
									onChangeText={(text) => {
										this.onChangeText(text, 'reminderdaysbefore');
									}}
									value={this.state.settings.reminderdaysbefore}/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 1,
										fontWeight: 'bold'
									}}
								>Send method notifications</Label>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Email</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'notificationsmethodemail');
										}}
										value={this.state.settings.notificationsmethodemail}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>SMS</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10,
											marginBottom: 10,
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'notifificationsmethodsms');
										}}
										value={this.state.settings.notifificationsmethodsms}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 1,
										fontWeight: 'bold'
									}}
								>Alerts</Label>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8 }}
									>Receive system alerts</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10,
											marginBottom: 10,
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'systemalerts');
										}}
										value={this.state.settings.systemalerts}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									marginRight: 15,
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Receive user alerts</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10,
											marginBottom: 10,
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'useralerts');
										}}
										value={this.state.settings.useralerts}
									/>
							</View>
							<View
								style={{
									marginTop: 15,
									marginBottom: 15,
									flex: 1,
									flexDirection: 'row',
									alignSelf: 'center',
									alignItems: 'center',
								}}
							>
								<Button
									danger
									small
									rounded
									onPress={() =>
										{
										this.goToSignOutConfirmation();
									}}
									style={{
										width: fullWidth - 250,
										justifyContent: 'center',
									}}
								>
								<Text>Sign out</Text>
								</Button>
							</View>
						</KeyboardAwareScrollView>
					}
					</Modal>
			</View>
		);
	}
}

const mapStateToProps = state => {
	return state;
};

export default connect(mapStateToProps, { modalState, setModalState })(ModalSide);
