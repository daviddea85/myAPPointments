import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Image, AsyncStorage, ListView, View, Keyboard, Dimensions, TouchableOpacity, Alert, Switch } from 'react-native';
import { Container, Label, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, ListItem, Spinner } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
import ActionButton from 'react-native-action-button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import PouchDB from 'pouchdb-react-native';
import TextField from '../containers/common/TextField';
import ImagePicker from 'react-native-image-crop-picker';
import { InfoRowStacked } from './common/InfoRowStacked';

let DBCompanyConnection = null;

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

class Contacts extends Component {

	constructor(props) {
		super(props);
		const dsAdresses = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsTelephones = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsEmails = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			contactid: this.props.contactid || '',
			contactinfo: {
				doctype: 'contact',
				hasThumbnail: false,
				emailAddresses: [],
				postalAddresses: [],
				middleName: '',
				company: '',
				jobTitle: '',
				familyName: '',
				thumbnailPath: '',
				recordID: '',
				givenName: '',
				phoneNumbers: [],
				imported: false,
				shareimportedcontacts: false,
				sharecreatedcontacts: false,
				userid: '',
			},
			addresseslist: dsAdresses.cloneWithRows([]),
			addresses: [],
			telephoneslist: dsTelephones.cloneWithRows([]),
			telephones: [],
			emailslist: dsEmails.cloneWithRows([]),
			emails: [],
			showspinner: false,
			showspinnertext: '',
		};
		this.companyDatabase = '';
		this.userLoggedId = '';
		this.addressTitle = 'Add new address';
		this.renderRowAddresses = this.renderRowAddresses.bind(this);
		this.emailsTitle = 'Add new email';
		this.renderRowEmails = this.renderRowEmails.bind(this);
		this.phonesTitle = 'Add new telephone';
		this.renderRowTelephones = this.renderRowTelephones.bind(this);
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
		const dsAdresses = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsTelephones = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsEmails = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		if (!_.isEmpty(this.state.contactid)) {
			const queryContacts = { selector: { doctype: 'contact', _id: this.state.contactid }, };
			const contactInfo = await DBCompanyConnection.find(queryContacts);
			if (contactInfo.docs.length > 0) {
				for (let c = 0; c < contactInfo.docs.length; c += 1) {
					this.setState({
						contactinfo: contactInfo.docs[c],
						showspinner: false,
						addresseslist: dsAdresses.cloneWithRows(contactInfo.docs[c].postalAddresses),
						addresses: contactInfo.docs[c].postalAddresses,
						telephoneslist: dsTelephones.cloneWithRows(contactInfo.docs[c].phoneNumbers),
						telephones: contactInfo.docs[c].phoneNumbers,
						emailslist: dsEmails.cloneWithRows(contactInfo.docs[c].emailAddresses),
						emails: contactInfo.docs[c].emailAddresses
					});
				}
			}
		} else {
			this.setState({
				contactinfo: this.state.contactinfo,
				showspinner: false,
				addresseslist: dsAdresses.cloneWithRows([]),
				telephoneslist: dsTelephones.cloneWithRows([]),
				emailslist: dsEmails.cloneWithRows([]),
			});
		}
	}

	connectCompanyDb(isConnected) {
		this.setState({ showspinner: true, showspinnertext: 'Loading contact info, please wait' });
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getContactInfo();
		}
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	onChangeAddress(newValue, prop, addressInfo) {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const newaddress = this.state.addresses;
		for (let i = 0; i < newaddress.length; i += 1) {
			if (addressInfo === newaddress[i]) {
				if (prop === 'label') {
					newaddress[i].label = newValue;
				} else if (prop === 'postCode') {
					newaddress[i].postCode = newValue;
				} else if (prop === 'city') {
					newaddress[i].city = newValue;
				} else if (prop === 'region') {
					newaddress[i].region = newValue;
				} else if (prop === 'country') {
					newaddress[i].country = newValue;
				} else if (prop === 'street') {
					newaddress[i].street = newValue;
				} else if (prop === 'state') {
					newaddress[i].state = newValue;
				}
			}
		}
		this.setState({ addresseslist: ds.cloneWithRows(newaddress), address: newaddress });
		const postalAddresses = 'postalAddresses';
		const incontact = this.state.contactinfo;
		incontact[postalAddresses] = newaddress;
		this.setState({ contactinfo: incontact });
	}

	onChangeTelephone(newValue, prop, telephoneInfo) {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const newtelephone = this.state.telephones;
		for (let i = 0; i < newtelephone.length; i += 1) {
			if (telephoneInfo === newtelephone[i]) {
				if (prop === 'label') {
					newtelephone[i].label = newValue;
				} else if (prop === 'number') {
					newtelephone[i].number = newValue;
				}
			}
		}
		this.setState({ telephoneslist: ds.cloneWithRows(newtelephone), telephones: newtelephone });
		const phoneNumbers = 'phoneNumbers';
		const incontact = this.state.contactinfo;
		incontact[phoneNumbers] = newtelephone;
		this.setState({ contactinfo: incontact });
	}

	onChangeEmail(newValue, prop, emailInfo) {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const newemail = this.state.emails;
		for (let i = 0; i < newemail.length; i += 1) {
			if (emailInfo === newemail[i]) {
				if (prop === 'label') {
					newemail[i].label = newValue;
				} else if (prop === 'email') {
					newemail[i].email = newValue;
				}
			}
		}
		this.setState({ emailslist: ds.cloneWithRows(newemail), emails: newemail });
		const emailAddresses = 'emailAddresses';
		const incontact = this.state.contactinfo;
		incontact[emailAddresses] = newemail;
		this.setState({ contactinfo: incontact });
	}

	onChangeText(newValue, prop) {
		const incontact = this.state.contactinfo;
		incontact[prop] = newValue;
		this.setState({ contactinfo: incontact });
	}

	contactButtons() {
		if (this.state.contactinfo.userid === this.userLoggedId) {
			if (this.state.contactid === '') {
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
						<ActionButton.Item buttonColor="#8fbc8f" title="Save contact" onPress={() => { this.saveContact(); }}>
							<IconMaterial name="save" size={28} color="white" />
						</ActionButton.Item>
					</ActionButton>
				);
			}
			return(
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
					<ActionButton.Item buttonColor="#8fbc8f" title="Update contact" onPress={() => { this.saveContact(); }}>
						<IconMaterial name="save" size={28} color="white" />
					</ActionButton.Item>
					<ActionButton.Item buttonColor="#f08080" title="Delete contact" onPress={() => { this.deleteContactConfirmationAlert(); }}>
						<IconMaterial name="delete" size={28} color="white" />
					</ActionButton.Item>
				</ActionButton>
			);
		}
		return (null);
	}

	async saveContact() {
		this.setState({ showspinner: true, showspinnertext: 'Saving contact info, please wait' });
		if (this.state.contactid === '') {
			this.state.contactinfo.userid = this.userLoggedId;
			const createdcontact = await DBCompanyConnection.post(this.state.contactinfo);
			const newrev = createdcontact.rev;
			const newid = createdcontact.id;
			this.onChangeText(newrev, '_rev');
			this.onChangeText(newid, '_id');
			this.saveContactAlert('created', newid);
		} else {
			if (this.state.contactinfo.userid === '') {
				this.state.contactinfo.userid = this.userLoggedId;
			}
			const updatedcontact = await DBCompanyConnection.put(this.state.contactinfo);
			const newrev = updatedcontact.rev;
			const newid = updatedcontact.id;
			this.onChangeText(newrev, '_rev');
			this.saveContactAlert('updated', newid);
		}
	}

	async saveContactAlert(saveText, contactid) {
		this.setState({ contactid: contactid, showspinner: false });
		Alert.alert(
			`Contact ${saveText}`,
			`The contact ${this.state.contactinfo.givenName} has been ${saveText}`,
			[
				{ text: 'OK', onPress: () => console.log('contact created/updated'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	deleteContactConfirmationAlert() {
		Alert.alert(
			'Delete contact',
			`Are you sure you want to delete the contact ${this.state.contactinfo.givenName}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteContact(), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel image delete'), style: 'cancel' }
			],
			{ cancelable: false }
		);
	}

	async deleteContact() {
		this.setState({ showspinner: true, showspinnertext: 'Deleting contact, please wait' });
		const contactDeleted = await DBCompanyConnection.remove(this.state.contactinfo);
		this.deletedContactAlert();
	}

	deletedContactAlert() {
		this.setState({ showspinner: false });
		Alert.alert(
			'Contact deleted',
			`The contact ${this.state.contactinfo.givenName} has been deleted`,
			[
				{ text: 'OK', onPress: () => Actions.Contacts({ title: 'Contacts' }), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	deleteImageConfirmation() {
		Alert.alert(
			'Delete image',
			`Are you sure you want to delete the image for the contact ${this.state.contactinfo.givenName}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteImage(), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel image delete'), style: 'cancel' }
			],
			{ cancelable: false }
		);
	}

	deleteImage() {
		this.state.contactinfo.hasThumbnail = false;
		this.state.contactinfo.thumbnailPath = '';
		this.setState({ contactinfo: this.state.contactinfo });
	}

	choosePhoto(cropit) {
		ImagePicker.openPicker({
			cropping: cropit,
			width: 400,
			height: 400,
			includeBase64: true
		}).then((imageInfo) => {
			this.state.contactinfo.hasThumbnail = true;
			this.state.contactinfo.thumbnailPath = `data:${imageInfo.mime};base64,${imageInfo.data}`;
			this.setState({ contactinfo: this.state.contactinfo });
		}).catch('error', (error) => {
			Alert.alert(
				'Image selected error',
				error.message,
				[
					{ text: 'Ok', onPress: () => console.log('error select image'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		});
	}

	addPhoto(cropit) {
		ImagePicker.openCamera({
			cropping: cropit,
			width: 400,
			height: 400,
			includeBase64: true
		}).then((imageInfo) => {
			this.state.contactinfo.hasThumbnail = true;
			this.state.contactinfo.thumbnailPath = `data:${imageInfo.mime};base64,${imageInfo.data}`;
			this.setState({ contactinfo: this.state.contactinfo });
		}).catch('error', (error) => {
			Alert.alert(
				'Image Upload Error',
				error.message,
				[
					{ text: 'Ok', onPress: () => console.log('error upload image'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		});
	}

	addNewAddress() {
		const postalAddressesObject = {
			label: '',
			postCode: '',
			city: '',
			region: '',
			country: '',
			street: '',
			state: '',
		};
		const dsAddress = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		let newaddresslist = this.state.addresses;
		newaddresslist.push(postalAddressesObject);
		newaddresslist = _.sortBy(newaddresslist, ['label']);
		this.setState({ addresseslist: dsAddress.cloneWithRows(newaddresslist), addresses: newaddresslist });
	}

	deleteAddressConfirmation(address) {
		Alert.alert(
			'Address delete',
			`Are you sure you want to delete the address ${address.street}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteAddress(address), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel address delete'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	deleteAddress(address) {
		const dsAddress = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		for (let a = 0; a < this.state.addresses.length; a += 1) {
			if (JSON.stringify(this.state.addresses[a]) === JSON.stringify(address)) {
				const index = this.state.addresses.indexOf(address);
				this.state.addresses.splice(index, 1);
			}
		}
		this.setState({ addresses: this.state.addresses, addresseslist: dsAddress.cloneWithRows(this.state.addresses) });
	}

	addNewEmail() {
		const EmailsObject = {
			label: '',
			email: ''
		};
		const dsEmails = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		let newemailslist = this.state.emails;
		newemailslist.push(EmailsObject);
		newemailslist = _.sortBy(newemailslist, ['label']);
		this.setState({ emailslist: dsEmails.cloneWithRows(newemailslist), emails: newemailslist });
	}

	deleteEmailConfirmation(email) {
		Alert.alert(
			'Email delete',
			`Are you sure you want to delete the email ${email.email}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteEmail(email), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel email delete'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	deleteEmail(email) {
		const dsEmails = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		for (let e = 0; e < this.state.emails.length; e += 1) {
			if (JSON.stringify(this.state.emails[e]) === JSON.stringify(email)) {
				const index = this.state.emails.indexOf(email);
				this.state.emails.splice(index, 1);
			}
		}
		this.setState({ emails: this.state.emails, emailslist: dsEmails.cloneWithRows(this.state.emails) });
	}

	addNewPhone() {
		const phoneNumbersObject = {
			label: '',
			number: ''
		};
		const dsPhones = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		let newphoneslist = this.state.telephones;
		newphoneslist.push(phoneNumbersObject);
		newphoneslist = _.sortBy(newphoneslist, ['label']);
		this.setState({ telephoneslist: dsPhones.cloneWithRows(newphoneslist), telephones: newphoneslist });
	}

	deletePhoneConfirmation(telephone) {
		Alert.alert(
			'Telephone delete',
			`Are you sure you want to delete the phone ${telephone.number}?`,
			[
				{ text: 'Yes', onPress: () => this.deletePhone(telephone), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel telephone delete'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	deletePhone(telephone) {
		const dsPhones = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		for (let p = 0; p < this.state.telephones.length; p += 1) {
			if (JSON.stringify(this.state.telephones[p]) === JSON.stringify(telephone)) {
				const index = this.state.telephones.indexOf(telephone);
				this.state.telephones.splice(index, 1);
			}
		}
		this.setState({ telephones: this.state.telephones, telephoneslist: dsPhones.cloneWithRows(this.state.telephones) });
	}

	renderRowAddresses(address) {
		address.label = address.label.charAt(0).toUpperCase() + address.label.slice(1);
		if (_.isEmpty(address) !== true) {
			return (
				<View style={{ padding: 5 }}>
					<View
						style={{
							borderRadius: 6,
							borderWidth: 1,
							borderColor: '#d7d7d6',
							flex: 1,
							flexDirection: 'row'
						}}
					>
						{this.state.contactinfo.userid === this.userLoggedId &&
							<View
								style={{
									flex: 0.1
								}}
							>
								<ActionButton size={24} icon={<MaterialCommunityIcons name="minus" size={16} color="white" />} buttonColor="#f08080" offsetX={0} offsetY={220} onPress={() => { this.deleteAddressConfirmation(address); }} /> 
							</View>
						}
						{this.state.contactinfo.userid !== this.userLoggedId &&
							<View
								style={{
									padding: 10
								}}
							>
								<InfoRowStacked label="Label" value={address.label} />
								<InfoRowStacked label="Street" value={address.street} />
								<InfoRowStacked label="PostCode" value={address.postCode} />
								<InfoRowStacked label="City" value={address.city} />
								<InfoRowStacked label="Region" value={address.region} />
								<InfoRowStacked label="State" value={address.state} />
								<InfoRowStacked label="Country" value={address.country} />
							</View>
						}
						{this.state.contactinfo.userid === this.userLoggedId &&
							<View
								style={{
									paddingTop: 10,
									paddingLeft: 10,
									paddingRight: 10,
									flex: 0.8
								}}
							>
								<TextField label="Label" value={address.label} onChangeText={value => this.onChangeAddress(value, 'label', address)} />
								<TextField label="Street" value={address.street} onChangeText={value => this.onChangeAddress(value, 'street', address)} />
								<TextField label="Postcode" value={address.postCode} onChangeText={value => this.onChangeAddress(value, 'postCode', address)} />
								<TextField label="City" value={address.city} onChangeText={value => this.onChangeAddress(value, 'city', address)} />
								<TextField label="Region" value={address.region} onChangeText={value => this.onChangeAddress(value, 'region', address)} />
								<TextField label="State" value={address.state} onChangeText={value => this.onChangeAddress(value, 'state', address)} />
								<TextField label="Country" value={address.country} onChangeText={value => this.onChangeAddress(value, 'country', address)} />
							</View>
						}
					</View>
				</View>
			);
		}
		return (null);
	}

	renderRowTelephones(telephone) {
		if (_.isEmpty(telephone) !== true) {
			telephone.label = telephone.label.charAt(0).toUpperCase() + telephone.label.slice(1);
			return (
				<View style={{ padding: 5 }}>
					<View
						style={{
							borderRadius: 6,
							borderWidth: 1,
							borderColor: '#d7d7d6',
							flex: 1,
							flexDirection: 'row'
						}}
					>
						{this.state.contactinfo.userid === this.userLoggedId &&
							<View
								style={{
									flex: 0.1
								}}
							>
								<ActionButton size={24} icon={<MaterialCommunityIcons name="minus" size={16} color="white" />} buttonColor="#f08080" offsetX={0} offsetY={60} onPress={() => { this.deletePhoneConfirmation(telephone); }} /> 
							</View>
						}
						{this.state.contactinfo.userid !== this.userLoggedId &&
							<View
								style={{
									padding: 10
								}}
							>
								<InfoRowStacked label="Label" value={telephone.label} />
								<InfoRowStacked label="Number" value={telephone.number} />
							</View>
						}
						{this.state.contactinfo.userid === this.userLoggedId &&
							<View
								style={{
									paddingTop: 10,
									paddingLeft: 10,
									paddingRight: 10,
									flex: 0.8
								}}
							>
								
								<TextField label="Label" value={telephone.label} onChangeText={value => this.onChangeTelephone(value, 'label', telephone )} />
								<TextField label="Number" value={telephone.number} onChangeText={value => this.onChangeTelephone(value, 'number', telephone )} />
							</View>
						}
					</View>
				</View>
			);
		}
		return (null);
	}

	renderRowEmails(email) {
		if (_.isEmpty(email) !== true) {
			email.label = email.label.charAt(0).toUpperCase() + email.label.slice(1);
			return (
				<View style={{ padding: 5 }}>
					<View
						style={{
							borderRadius: 6,
							borderWidth: 1,
							borderColor: '#d7d7d6',
							flex: 1,
							flexDirection: 'row'
						}}
					>
						{this.state.contactinfo.userid === this.userLoggedId &&
							<View
								style={{
									flex: 0.1
								}}
							>
								<ActionButton size={24} icon={<MaterialCommunityIcons name="minus" size={16} color="white" />} buttonColor="#f08080" offsetX={0} offsetY={60} onPress={() => { this.deleteEmailConfirmation(email); }} /> 
							</View>
						}
						{this.state.contactinfo.userid !== this.userLoggedId &&
							<View
								style={{
									padding: 10
								}}
							>
								<InfoRowStacked label="Label" value={email.label} />
								<InfoRowStacked label="Email" value={email.email} />
							</View>
						}
						{this.state.contactinfo.userid === this.userLoggedId &&
							<View
								style={{
									paddingTop: 10,
									paddingLeft: 10,
									paddingRight: 10,
									flex: 0.8
								}}
							>
								<TextField label="Label" value={email.label} onChangeText={value => this.onChangeEmail(value, 'label', email )} />
								<TextField label="Email" value={email.email} onChangeText={value => this.onChangeEmail(value, 'email', email )} />
							</View>
						}
					</View>
				</View>
			);
		}
		return (null);
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Content style={{ padding: 20 }}>
					{this.state.contactinfo.userid !== this.userLoggedId &&
						<View>
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
							{this.state.showspinner === false &&
								<View>
									<View
										style={{
											flex: 1,
											flexDirection: 'row',
										}}
									>
										{this.state.contactinfo.thumbnailPath === '' &&
										<View style={{ flex: 0.3 }}>
											<Image
												style={{
													marginBottom: 12,
													width: 80,
													height: 80,
													borderRadius: 80/2,
													borderWidth: 2,
													borderColor: 'steelblue',
													backgroundColor: 'transparent',
												}}
												source={require('../img/contacts.png')}
											/>
										</View>
									}
									{this.state.contactinfo.thumbnailPath !== '' &&
										<View style={{ flex: 0.3 }}>
											<Image
												style={{
													marginBottom: 12,
													width: 80,
													height: 80,
													borderRadius: 80/2,
													borderWidth: 2,
													borderColor: 'steelblue',
													backgroundColor: 'transparent',
												}}
												source={{ uri: this.state.contactinfo.thumbnailPath }}
											/>
										</View>
									}
										<View style={{ flex: 0.6 }} />
									</View>
									<View>
										<InfoRowStacked label="Name" value={this.state.contactinfo.givenName} />
										<InfoRowStacked label="Middle name" value={this.state.contactinfo.middleName} />
										<InfoRowStacked label="Family name" value={this.state.contactinfo.familyName} />
										<InfoRowStacked label="Company" value={this.state.contactinfo.company} />
										<InfoRowStacked label="Job title" value={this.state.contactinfo.jobTitle} />
										<View
											style={{
												flex: 1,
												flexDirection: 'row',
												padding: 10
											}}
										>
											<Text note style={{ flex: 0.4, flexDirection: 'row' }}>Address(es)</Text>
										</View>
										<ListView
											dataSource={this.state.addresseslist}
											enableEmptySections
											renderRow={this.renderRowAddresses.bind(this)}
										/>
										<View
											style={{
												flex: 1,
												flexDirection: 'row',
												padding: 10
											}}
										>
											<Text note style={{ flex: 0.4, flexDirection: 'row' }}>Telephone(s)</Text>
										</View>
										<ListView
											dataSource={this.state.telephoneslist}
											enableEmptySections
											renderRow={this.renderRowTelephones.bind(this)}
										/>
										<View
											style={{
												flex: 1,
												flexDirection: 'row',
												padding: 10
											}}
										>
											<Text note style={{ flex: 0.4, flexDirection: 'row' }}>Email(s)</Text>
										</View>
										<ListView
											dataSource={this.state.emailslist}
											enableEmptySections
											renderRow={this.renderRowEmails.bind(this)}
										/>

									</View>
									<View style={{ height: 60 }} />
								</View>
							}
						</View>
					}
					{this.state.contactinfo.userid === this.userLoggedId &&
						<View>
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
							{this.state.showspinner === false &&
							<View>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
									}}
								>
									{this.state.contactinfo.thumbnailPath === '' &&
										<View style={{ flex: 0.3 }}>
											<Image
												style={{
													marginBottom: 12,
													width: 80,
													height: 80,
													borderRadius: 80/2,
													borderWidth: 2,
													borderColor: 'steelblue',
													backgroundColor: 'transparent',
												}}
												source={require('../img/contacts.png')}
											/>
										</View>
									}
									{this.state.contactinfo.thumbnailPath !== '' &&
										<View style={{ flex: 0.3 }}>
											<Image
												style={{
													marginBottom: 12,
													width: 80,
													height: 80,
													borderRadius: 80/2,
													borderWidth: 2,
													borderColor: 'steelblue',
													backgroundColor: 'transparent',
												}}
												source={{ uri: this.state.contactinfo.thumbnailPath }}
											/>
										</View>
									}
									<View
										style={{
											flex: 0.1,
											marginTop: 22
										}}
									>
										{this.state.contactinfo.thumbnailPath !== '' &&
											<ActionButton size={24} icon={<IconMaterial name="delete" size={16} color="white" />} buttonColor="#f08080" offsetX={10} offsetY={-40} onPress={() => { this.deleteImageConfirmation(); }} />
										}
										{this.state.contactinfo.thumbnailPath === '' &&
											<ActionButton
												size={24}
												buttonColor="#9DBDF2"
												offsetX={10}
												offsetY={-40}
												spacing={15}
												textStyle={{
												}}
												textContainerStyle={{
													left: 35,
													width: 170,
													height: 21,
													shadowOpacity: 0.35,
													shadowOffset: {
														width: 0,
														height: 5
													},
													shadowColor: '#000',
													shadowRadius: 3,
													elevation: 5
												}}
												ref={(btn) => {
													this.floatingBtn = btn;
												}}
												onPress={() => { this.hideKeyboard(); }}
												icon={<IconMaterial name="settings" size={16} color="white" />}
											>
												<ActionButton.Item buttonColor="#293E6A" title="Choose image from library" onPress={() => { this.choosePhoto(true); }}>
													<IconMaterial name="photo-library" size={16} color="white" />
												</ActionButton.Item>
												<ActionButton.Item buttonColor="steelblue" title="Add image" onPress={() => { this.addPhoto(true); }}>
													<IconMaterial name="add-a-photo" size={16} color="white" />
												</ActionButton.Item>
											</ActionButton>
										}
									</View>
									<View style={{ flex: 0.5 }} />
								</View>
								<TextField label="Name" value={this.state.contactinfo.givenName} onChangeText={value => this.onChangeText(value, 'givenName')} />
								<TextField label="Middle name" value={this.state.contactinfo.middleName} onChangeText={value => this.onChangeText(value, 'middleName')} />
								<TextField label="Family name" value={this.state.contactinfo.familyName} onChangeText={value => this.onChangeText(value, 'familyName')} />
								<TextField label="Company" value={this.state.contactinfo.company} onChangeText={value => this.onChangeText(value, 'company')} />
								<TextField label="Job title" value={this.state.contactinfo.jobTitle} onChangeText={value => this.onChangeText(value, 'jobTitle')} />
								{this.state.contactinfo.imported === false &&
									<View
										style={{
											flex: 1,
											flexDirection: 'row',
											marginRight: 15,
										}}
									>
										<Text note
											style={{
												paddingTop: 15,
												color: '#666666',
												paddingLeft: 5,
												fontSize: 14,
												flex: 0.9
											}}
										>Share created contact</Text>
											<Switch
												style={{
													flex: 0.1,
													marginRight: 10,
													marginTop: 10,
													marginBottom: 10,
												}}
												onValueChange={(value) => {
													this.onChangeText(value, 'sharecreatedcontacts');
												}}
												value={this.state.contactinfo.sharecreatedcontacts}
											/>
									</View>
								} 
								{this.state.contactinfo.imported === true &&
									<View
										style={{
											flex: 1,
											flexDirection: 'row',
											marginRight: 15,
										}}
									>
										<Text note
											style={{
												paddingTop: 15,
												color: '#666666',
												paddingLeft: 5,
												fontSize: 14,
												flex: 0.9
											}}
										>Share imported contact</Text>
											<Switch
												style={{
													flex: 0.1,
													marginRight: 10,
													marginTop: 10,
													marginBottom: 10,
												}}
												onValueChange={(value) => {
													this.onChangeText(value, 'shareimportedcontacts');
												}}
												value={this.state.contactinfo.shareimportedcontacts}
											/>
									</View>
								} 
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										padding: 10
									}}
								>
									<Text note style={{ flex: 0.4, flexDirection: 'row' }}>{this.addressTitle}</Text>
									<View style={{ flex: 0.1, flexDirection: 'row' }}>
										<ActionButton size={24} icon={<MaterialCommunityIcons name="plus" size={16} color="white" />} buttonColor="#8fbc8f" offsetX={0} offsetY={0} onPress={() => { this.addNewAddress(); }} /> 
									</View>
									<View style={{ flex: 0.4, flexDirection: 'row'}} />
								</View>
								<ListView
									dataSource={this.state.addresseslist}
									enableEmptySections
									renderRow={this.renderRowAddresses.bind(this)}
								/>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										padding: 10
									}}
								>
									<Text note style={{ flex: 0.4, flexDirection: 'row' }}>{this.phonesTitle}</Text>
									<View style={{ flex: 0.1, flexDirection: 'row' }}>
										<ActionButton size={24} icon={<MaterialCommunityIcons name="plus" size={16} color="white" />} buttonColor="#8fbc8f" offsetX={0} offsetY={0} onPress={() => { this.addNewPhone(); }} /> 
									</View>
									<View style={{ flex: 0.4, flexDirection: 'row'}} />
								</View>
								<ListView
									dataSource={this.state.telephoneslist}
									enableEmptySections
									renderRow={this.renderRowTelephones.bind(this)}
								/>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										padding: 10
									}}
								>
									<Text note style={{ flex: 0.4, flexDirection: 'row' }}>{this.emailsTitle}</Text>
									<View style={{ flex: 0.1, flexDirection: 'row' }}>
										<ActionButton size={24} icon={<MaterialCommunityIcons name="plus" size={16} color="white" />} buttonColor="#8fbc8f" offsetX={0} offsetY={0} onPress={() => { this.addNewEmail(); }} /> 
									</View>
									<View style={{ flex: 0.4, flexDirection: 'row'}} />
								</View>
								<ListView
									dataSource={this.state.emailslist}
									enableEmptySections
									renderRow={this.renderRowEmails.bind(this)}
								/>
							</View>
							}
							<View style={{ height: 70 }} />
						</View>
					}
					</Content>
					{this.contactButtons()}
				<FooterMain activeArea="Contacts" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(Contacts);

	