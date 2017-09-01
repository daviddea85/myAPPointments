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
			showimporting: false,
			showremoving: false,
			showrefreshing: false,
			settings: {
				_id: '',
				doctype: 'settings',
				importcontacts: false,
				appointmentsameday: false,
				appointmentdaysbefore: '',
				remindersameday: false,
				reminderdaysbefore: '',
				notificationsmethodemail: false,
				notifificationsmethodsms: false,
				systemalerts: false,
				useralerts: false,
				userid: ''
			},
		};
		this.companyDatabase = '';
	}

	componentWillMount() {
		console.log('modal componentWillMount');
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				console.log('this.companyDatabase');
				console.log(this.companyDatabase);
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {

						console.log('this.state.settings.userid');
						console.log(this.state.settings.userid);
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
		console.log('modal receive props');
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				console.log('this.companyDatabase');
				console.log(this.companyDatabase);
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {

						console.log('this.state.settings.userid');
						console.log(this.state.settings.userid);
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
				const insettings = this.state.settings;
				insettings[prop] = newValue;
				this.setState({ settings: insettings });
				this.setState({ showimporting: true });
				this.saveSettings();
				this.getContactsFromDevice();
			} else {
				const insettings = this.state.settings;
				insettings[prop] = newValue;
				this.setState({ settings: insettings });
				this.setState({ showremoving: true });
				this.saveSettings();
				this.deleteContactsFromDB();
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
			console.log('save');
			const savedSettings = await DBCompanyConnection.put(this.state.settings);
			const insettings = this.state.settings;
			insettings['_rev'] = savedSettings._rev;
			this.setState({ settings: insettings });
			// this.getSettingsInfo();
		} else {
			console.log('create');
			const settings = {
				doctype: 'settings',
				importcontacts: this.state.settings.importcontacts,
				appointmentsameday: this.state.settings.appointmentsameday,
				appointmentdaysbefore: this.state.settings.appointmentdaysbefore,
				remindersameday: this.state.settings.remindersameday,
				reminderdaysbefore: this.state.settings.reminderdaysbefore,
				notificationsmethodemail: this.state.settings.notificationsmethodemail,
				notifificationsmethodsms: this.state.settings.notifificationsmethodsms,
				systemalerts: this.state.settings.systemalerts,
				useralerts: this.state.settings.useralerts,
				userid: this.state.settings.userid
			};
			const newSettings = await DBCompanyConnection.post(settings);
			const insettings = this.state.settings;
			insettings['_rev'] = newSettings.rev;
			this.setState({ settings: insettings });
			// this.getSettingsInfo();
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
			firebase.auth().signOut();
			this.props.setModalState({ prop: 'modalConfigShow', value: false });
			Actions.login();
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
				this.setState({ showspinner: true });
				this.setState({ showremoving: true });
				const contactdeleted = await DBCompanyConnection.remove(contactinfo.docs[i]);
			}
			this.setState({ showspinner: false });
			this.setState({ showremoving: false });
		}
	}

	async updateDBContacts(contacts) {
		if (this.state.settings.importcontacts === true) {
			const queryContact = { selector: { doctype: 'contact', 'imported': true, 'userid': this.state.settings.userid }, };
			const contactsdb = await DBCompanyConnection.find(queryContact);
			if (contactsdb.docs.length > 0) {
				for (let i = 0; i < contacts.length; i += 1) {
					this.setState({ showspinner: true });
					let contactfound = _.find(contactsdb.docs, {recordID : contacts[i].recordID});
					this.setState({ showrefreshing: true });
					console.log('contactfound');
					console.log(contactfound);
					if (contactfound !== undefined) {
						contactfound.company = contacts[i].company;
						contactfound.emailAddresses = contacts[i].emailAddresses;
						contactfound.familyName = contacts[i].familyName;
						contactfound.givenName = contacts[i].givenName;
						contactfound.hasThumbnail = contacts[i].hasThumbnail;
						contactfound.jobTitle = contacts[i].jobTitle;
						contactfound.phoneNumbers = contacts[i].phoneNumbers;
						contactfound.postalAddresses = contacts[i].postalAddresses;
						contactfound.thumbnailPath = contacts[i].thumbnailPath;
						const savedcontact = await DBCompanyConnection.put(contactfound);
					} else {
						contacts[i].doctype = 'contact';
						contacts[i].imported = true;
						contacts[i].userid = this.state.settings.userid;
						const newcontact = await DBCompanyConnection.post(contacts[i]);
					}
				}
				this.setState({ showspinner: false });
				this.setState({ showrefreshing: false });
			} else {
				for (let i = 0; i < contacts.length; i += 1) {
					this.setState({ showspinner: true });
					this.setState({ showimporting: true });
					contacts[i].doctype = 'contact';
					contacts[i].imported = true;
					contacts[i].userid = this.state.settings.userid;
					await DBCompanyConnection.post(contacts[i]);
				}
				this.setState({ showspinner: false });
				this.setState({ showimporting: false });
				this.setState({ showrefreshing: false });
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

	getContactsFromDevice() {
		ContactsDevice.getAll((err, contacts) => {
			if(err === 'denied'){
				Alert.alert(
					error.code,
					error.message,
					[
						{ text: 'OK', onPress: () => console.log('OK Pressed') },
					],
					{ cancelable: false }
				);
				console.log('error');
			} else {
				this.updateDBContacts(contacts);
			}
		});
	}

	render() {
		if (this.state.showspinner === true) {
			this.processed_background = '#EFEFEF';
			this.processed_text = '#787878';
			this.processed_opacity = 0.1;
		} else {
			this.processed_background = 'white';
			this.processed_text = '#000000';
			this.processed_opacity = 1;
		}
		return (
			<View>
				<Modal transparent={false} visible={this.props.ModalState.modalConfigShow} onRequestClose={() => { console.log('settings closed'); }} >
					<Header>
						<Left />
						<Body>
							<Title
								style={{
									paddingLeft: (Platform.OS === 'ios') ? 0 : 60,
									justifyContent: 'center',
								}}
							>Settings</Title>
						</Body>
						<Right>
						{!this.state.showspinner &&
							<Button transparent onPress={() => { this.props.setModalState({ prop: 'modalConfigShow', value: false }); }}>
								<Icon name="ios-close-outline" size={22}/>
							</Button>
						}
						</Right>
					</Header>
						<KeyboardAwareScrollView>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									backgroundColor:
									this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8,
										fontWeight: 'bold'
									}}
								>Send appointment notifications</Label>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8 }}
									>Appointment same day</Label>
									<Switch
										style={{
											flex: 0.2,
											marginRight: 10,
											marginTop: 10
										}}
										onValueChange={(value) => {
											this.onChangeText(value, 'appointmentsameday');
										}}
										value={this.state.settings.appointmentsameday}
									/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
								}}
							>
								<Label
									style={{
										paddingTop: 15,
										marginLeft: 12,
										flex: 0.8
									}}
								>Appointment days before</Label>
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
										this.onChangeText(text, 'appointmentdaysbefore');
									}}
									value={this.state.settings.appointmentdaysbefore}
								/>
							</View>
							{this.state.showspinner &&
								<View
									style={{
										backgroundColor: 'white',
										marginRight: 15,
										marginLeft: 15,
										opacity: 1
									}}
								>
								<Spinner />
								</View>
							}
							{this.state.showimporting &&
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
							}
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
									backgroundColor: this.processed_background,
									marginRight: 15,
									opacity: this.processed_opacity
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
								>
								<Text>Sign out</Text>
								</Button>
							</View>
						</KeyboardAwareScrollView>
					</Modal>
			</View>
		);
	}
}

const mapStateToProps = state => {
	return state;
};

export default connect(mapStateToProps, { modalState, setModalState })(ModalSide);
