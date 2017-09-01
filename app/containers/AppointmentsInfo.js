import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Dimensions, Alert, AsyncStorage, View, Keyboard, Switch, ListView, TextInput, Image } from 'react-native';
import PouchDB from 'pouchdb-react-native';
import { Col, Grid, Row } from 'react-native-easy-grid';
import {
	StyleProvider,
	Container,
	Content,
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
	ListItem,
	List,
	Body,
	Spinner
} from 'native-base';
import _ from 'lodash';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButton from 'react-native-action-button';
import { Actions } from 'react-native-router-flux';
import { FooterMain } from '../containers/common/Footer';
import DatePicker from 'react-native-datepicker';
import ModalPicker from 'react-native-modal-picker';
import moment from 'moment';

const fullWidth = Dimensions.get('window').width; // full width

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;

class AppointmentsInfo extends Component {

	constructor(props) {
		super(props);
		this.mainTabs = null;
		this.floatingBtn = null;
		const dsImages = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		const dsAdresses = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		const dsTelephones = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		const dsEmails = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			showspinner: false,
			appointmentid: this.props.appointmentid || '',
			appointment: {
				_id: '',
				doctype: 'appointment',
				date: moment().format('DD-MM-YYYY'),
				hour: '',
				minute: '',
				contact_id: '',
				employee_id: '',
				notes: ''
			},
			treatment: {
				_id: '',
				doctype: 'treatment',
				appointment_id: this.props.appointmentid || '',
				contact_id: '',
				title: this.props.treatmentTitle || '',
				notes: '',
			},
			contact: {
				_id: '',
				doctype: '',
				imported: '',
				hasThumbnail: false,
				emailAddresses: [],
				postalAddresses: [],
				middleName: '',
				company: '',
				jobTitle: '',
				familyName: '',
				thumbnailPath: '',
				givenName: '',
				phoneNumbers: [],
				userid: '',
			},
			treatmentimages: {},
			imageslist: dsImages.cloneWithRows([]),
			addresseslist: dsAdresses.cloneWithRows([]),
			telephoneslist: dsTelephones.cloneWithRows([]),
			emailslist: dsEmails.cloneWithRows([]),
		};
		this.renderRowImages = this.renderRowImages.bind(this);
		this.renderRowAddresses = this.renderRowAddresses.bind(this);
		this.renderRowTelephones = this.renderRowTelephones.bind(this);
		this.renderRowEmails = this.renderRowEmails.bind(this);
		this.companyDatabase = '';
		this.currentTab = this.props.currentTab || 0;
	}

	componentWillMount() {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				this.connectCompanyDb(true);
				this._tabs.goToPage(this.currentTab);
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.goMenu) {
			Actions.pop({ refresh: { goMenu: true } });
		}
		if (nextProps.goBack) {
			this.connectCompanyDb(true);
		}
	}

	treatmentListModalControl() {
		Actions.AppointmentTreatmentsList({
			title: 'Treatment list',
			contact_id: this.state.appointment.contact_id,
			appointment_id: this.state.appointment._id,
			appointment_date: this.state.appointment.date,
		});
	}

	onChangeText(newValue, prop) {
		switch(prop){
		case 'employee_id':
			let employeeappointment = this.state.appointment;
			_.set(employeeappointment, prop, newValue.value);
			this.setState({ appointment: employeeappointment });
			employeeappointment = this.state.appointment;
			_.set(employeeappointment, 'employee_alias', newValue.label);
			this.setState({ appointment: employeeappointment });
			employeeappointment = this.state.appointment;
			_.set(employeeappointment, 'employee_details', newValue.label);
			this.setState({ appointment: employeeappointment });
			break;
		case 'contact_id':
			let contactappointment = this.state.appointment;
			_.set(contactappointment, prop, newValue.value);
			this.setState({ appointment: contactappointment });
			contactappointment = this.state.appointment;
			_.set(contactappointment, 'contact_details', newValue.label);
			this.setState({ appointment: contactappointment });
			contactappointment = this.state.appointment;
			_.set(contactappointment, 'contact_name', newValue.label);
			this.setState({ appointment: contactappointment });
			this.getAppointmentInfo();
			break;
		case 'hour':
			const hourappointment = this.state.appointment;
			_.set(hourappointment, 'hour', newValue.value);
			this.setState({ appointment: hourappointment });
			break;
		case 'minute':
			const minuteappointment = this.state.appointment;
			_.set(minuteappointment, 'minute', newValue.value);
			this.setState({ appointment: minuteappointment });
			break;
		default:
			const inappointment = this.state.appointment;
			_.set(inappointment, prop, newValue);
			this.setState({ appointment: inappointment });
			break;
		}
	}

	onChangeTextTreatment(newValue, prop) {
		const intreatment = this.state.treatment;
		_.set(intreatment, prop, newValue);
		this.setState({ treatment: intreatment });
	}

	async getAppointmentInfo() {
		this.setState({ showspinner: true });
		const dsImages = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsAdresses = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsTelephones = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsEmails = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const queryContact = { selector: { doctype: 'contact' }, };
		const contactInfo = await DBCompanyConnection.find(queryContact);
		this.contactsList = [];
		if (contactInfo.docs.length > 0) {
			for (let e = 0; e < contactInfo.docs.length; e += 1) {
				contactsListObject = {
					key: '',
					value: '',
					label: ''
				};
				contactsListObject.key = contactInfo.docs[e]._rev;
				contactsListObject.value = contactInfo.docs[e]._id;
				contactsListObject.label = contactInfo.docs[e].givenName+' '+contactInfo.docs[e].familyName;
				this.contactsList.push(contactsListObject);
			}
			this.contactsList = _.sortBy(this.contactsList, ['label']);
		}
		console.log('this.contactsList');
		console.log(this.contactsList);
		const queryEmployee = { selector: { doctype: 'user' }, };
		const employeeInfo = await DBCompanyConnection.find(queryEmployee);
		this.employeesList = [];
		if (employeeInfo.docs.length > 0) {
			for (let e = 0; e < employeeInfo.docs.length; e += 1) {
				employeesListObject = {
					key: '',
					value: '',
					label: ''
				};
				employeesListObject.label = employeeInfo.docs[e].alias;
				if (employeeInfo.docs[e].alias === '') {
					employeesListObject.label = employeeInfo.docs[e].name;
					if (employeeInfo.docs[e].name === '') {
						employeesListObject.label = employeeInfo.docs[e].email;
					}
				}
				employeesListObject.key = employeeInfo.docs[e]._rev;
				employeesListObject.value = employeeInfo.docs[e]._id;
				this.employeesList.push(employeesListObject);
			}
			this.employeesList = _.sortBy(this.employeesList, ['label']);
		}
		let indexHour = 0;
		this.hoursList = [
			{ key: indexHour++, label: '01', value: '01' },
			{ key: indexHour++, label: '02', value: '02' },
			{ key: indexHour++, label: '03', value: '03' },
			{ key: indexHour++, label: '04', value: '04' },
			{ key: indexHour++, label: '05', value: '05' },
			{ key: indexHour++, label: '06', value: '06' },
			{ key: indexHour++, label: '07', value: '07' },
			{ key: indexHour++, label: '08', value: '08' },
			{ key: indexHour++, label: '09', value: '09' },
			{ key: indexHour++, label: '10', value: '10' },
			{ key: indexHour++, label: '11', value: '11' },
			{ key: indexHour++, label: '12', value: '12' },
			{ key: indexHour++, label: '13', value: '13' },
			{ key: indexHour++, label: '14', value: '14' },
			{ key: indexHour++, label: '15', value: '15' },
			{ key: indexHour++, label: '16', value: '16' },
			{ key: indexHour++, label: '17', value: '17' },
			{ key: indexHour++, label: '18', value: '18' },
			{ key: indexHour++, label: '19', value: '19' },
			{ key: indexHour++, label: '20', value: '20' },
			{ key: indexHour++, label: '21', value: '21' },
			{ key: indexHour++, label: '22', value: '22' },
			{ key: indexHour++, label: '23', value: '23' },
			{ key: indexHour++, label: '24', value: '24' },
		];
		let indexMinute = 0;
		this.minutesList = [
			{ key: indexMinute++, label: '00', value: '00' },
			{ key: indexMinute++, label: '01', value: '01' },
			{ key: indexMinute++, label: '02', value: '02' },
			{ key: indexMinute++, label: '03', value: '03' },
			{ key: indexMinute++, label: '04', value: '04' },
			{ key: indexMinute++, label: '05', value: '05' },
			{ key: indexMinute++, label: '06', value: '06' },
			{ key: indexMinute++, label: '07', value: '07' },
			{ key: indexMinute++, label: '08', value: '08' },
			{ key: indexMinute++, label: '09', value: '09' },
			{ key: indexMinute++, label: '10', value: '10' },
			{ key: indexMinute++, label: '11', value: '11' },
			{ key: indexMinute++, label: '12', value: '12' },
			{ key: indexMinute++, label: '13', value: '13' },
			{ key: indexMinute++, label: '14', value: '14' },
			{ key: indexMinute++, label: '15', value: '15' },
			{ key: indexMinute++, label: '16', value: '16' },
			{ key: indexMinute++, label: '17', value: '17' },
			{ key: indexMinute++, label: '18', value: '18' },
			{ key: indexMinute++, label: '19', value: '19' },
			{ key: indexMinute++, label: '20', value: '20' },
			{ key: indexMinute++, label: '21', value: '21' },
			{ key: indexMinute++, label: '22', value: '22' },
			{ key: indexMinute++, label: '23', value: '23' },
			{ key: indexMinute++, label: '24', value: '24' },
			{ key: indexMinute++, label: '25', value: '25' },
			{ key: indexMinute++, label: '26', value: '26' },
			{ key: indexMinute++, label: '27', value: '27' },
			{ key: indexMinute++, label: '28', value: '28' },
			{ key: indexMinute++, label: '29', value: '29' },
			{ key: indexMinute++, label: '30', value: '30' },
			{ key: indexMinute++, label: '31', value: '31' },
			{ key: indexMinute++, label: '32', value: '32' },
			{ key: indexMinute++, label: '33', value: '33' },
			{ key: indexMinute++, label: '34', value: '34' },
			{ key: indexMinute++, label: '35', value: '35' },
			{ key: indexMinute++, label: '36', value: '36' },
			{ key: indexMinute++, label: '37', value: '37' },
			{ key: indexMinute++, label: '38', value: '38' },
			{ key: indexMinute++, label: '39', value: '39' },
			{ key: indexMinute++, label: '40', value: '40' },
			{ key: indexMinute++, label: '41', value: '41' },
			{ key: indexMinute++, label: '42', value: '42' },
			{ key: indexMinute++, label: '43', value: '43' },
			{ key: indexMinute++, label: '44', value: '44' },
			{ key: indexMinute++, label: '45', value: '45' },
			{ key: indexMinute++, label: '46', value: '46' },
			{ key: indexMinute++, label: '47', value: '47' },
			{ key: indexMinute++, label: '48', value: '48' },
			{ key: indexMinute++, label: '49', value: '49' },
			{ key: indexMinute++, label: '50', value: '50' },
			{ key: indexMinute++, label: '51', value: '51' },
			{ key: indexMinute++, label: '52', value: '52' },
			{ key: indexMinute++, label: '53', value: '53' },
			{ key: indexMinute++, label: '54', value: '54' },
			{ key: indexMinute++, label: '55', value: '55' },
			{ key: indexMinute++, label: '56', value: '56' },
			{ key: indexMinute++, label: '57', value: '57' },
			{ key: indexMinute++, label: '58', value: '58' },
			{ key: indexMinute++, label: '59', value: '59' },
		];
		console.log('this.state.appointmentid');
		console.log(this.state.appointmentid);
		if (this.state.appointmentid === '') {
			this.setState({
				appointment: this.state.appointment,
				treatment: this.state.treatment,
				contact: this.state.contact,
				imageslist: dsImages.cloneWithRows([]),
				addresseslist: dsAdresses.cloneWithRows([]),
				telephoneslist: dsTelephones.cloneWithRows([]),
				emailslist: dsEmails.cloneWithRows([])
			});
			this.setState({ showspinner: false });
		} else {
			const query = { selector: { doctype: 'appointment', _id: this.state.appointmentid }, };
			const appointmentInfo = await DBCompanyConnection.find(query);
			if (appointmentInfo.docs.length > 0) {
				const queryContact = { selector: { doctype: 'contact', _id: appointmentInfo.docs[0].contact_id }, };
				const contactInfo = await DBCompanyConnection.find(queryContact);
				appointmentInfo.docs[0].contact_name = 'Missing contact name';
				if (contactInfo.docs.length > 0) {
					appointmentInfo.docs[0].contact_name = contactInfo.docs[0].givenName +' '+contactInfo.docs[0].familyName;
				}
				const queryEmployee = { selector: { doctype: 'user', _id: appointmentInfo.docs[0].employee_id }, };
				const employeeInfo = await DBCompanyConnection.find(queryEmployee);
				appointmentInfo.docs[0].employee_alias = 'Missing employee alias';
				if (employeeInfo.docs.length > 0) {
					appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].alias;
					if (employeeInfo.docs[0].alias === '') {
						appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].name;
						if (employeeInfo.docs[0].name === '') {
							appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].email;
						}
					}
				}
				const queryTreatment = { selector: { doctype: 'treatment', appointment_id: this.state.appointmentid }, };
				const treatmentInfo = await DBCompanyConnection.find(queryTreatment);
				if (treatmentInfo.docs.length === 0) {
					this.state.treatment.appointment_id = this.state.appointmentid;
					treatmentInfo.docs[0] = this.state.treatment;
				} else {
					if (this.props.treatmentTitle !== undefined) {
						treatmentInfo.docs[0].title = this.props.treatmentTitle;
					}
				}
				this.treatmentimages = [];
				if (treatmentInfo.docs[0]._id !== '') {
					const queryTreatmentImages = { selector: { doctype: 'images', area: 'treatments', owner: treatmentInfo.docs[0]._id }, };
					const treatmentImages = await DBCompanyConnection.find(queryTreatment);
					if (treatmentImages.docs.length > 0) {
						this.treatmentimages.push(treatmentImages.docs);
					}
				}
				this.setState({
					appointment: appointmentInfo.docs[0],
					treatment: treatmentInfo.docs[0],
					contact: contactInfo.docs[0],
					imageslist: dsImages.cloneWithRows(this.treatmentimages),
					addresseslist: dsAdresses.cloneWithRows(contactInfo.docs[0].postalAddresses),
					telephoneslist: dsTelephones.cloneWithRows(contactInfo.docs[0].phoneNumbers),
					emailslist: dsEmails.cloneWithRows(contactInfo.docs[0].emailAddresses),
				 });
				this.setState({ showspinner: false });
			}
			this.setState({ showspinner: false });
		}
	}

	// validations for appointment

	async saveAppointment() {
		if (this.state.appointmentid === '') {
			const newappointment = {};
			newappointment.doctype = 'appointment';
			newappointment.date = this.state.appointment.date;
			newappointment.hour = this.state.appointment.hour;
			newappointment.minute = this.state.appointment.minute;
			newappointment.contact_id = this.state.appointment.contact_id;
			newappointment.employee_id = this.state.appointment.employee_id;
			newappointment.notes = this.state.appointment.notes;
			const savedappointment = await DBCompanyConnection.post(newappointment);
			const newrev = savedappointment.rev;
			this.onChangeText(newrev, '_rev');
			this.saveAppointmentAlert('created', savedappointment._id);
		} else {
			const updatedappointment = await DBCompanyConnection.put(this.state.appointment);
			const newrev = updatedappointment.rev;
			this.onChangeText(newrev, '_rev');
			this.saveAppointmentAlert('updated', updatedappointment._id);
		}
	}

	async saveAppointmentAlert(saveText, appointmentid) {
		console.log('appointmentid');
		console.log(appointmentid);
		// const query = { selector: { doctype: 'contact', _id: this.state.appointment.contact_id }, };
		// const contactinfo = await DBCompanyConnection.find(query);
		// if (contactinfo.docs.length > 0) {
			// this.setState({ contact: contactinfo.docs[0] });
		this.setState({ appointmentid: appointmentid });
		// }
		Alert.alert(
			`Appointment ${saveText}`,
			`The appointment for ${this.state.appointment.contact_name} on ${this.state.appointment.date} at ${this.state.appointment.hour}:${this.state.appointment.minute} has been ${saveText}`,
			[
				{ text: 'OK', onPress: () => this.getAppointmentInfo(), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async deleteAppointment() {
		const appointmentDeleted = await DBCompanyConnection.remove(this.state.appointment);
		if (this.state.treatment._id !== '') {
			const treatmentDeleted = await DBCompanyConnection.remove(this.state.treatment);
		}
		this.deleteAppointmentAlert();
	}

	deleteAppointmentConfirmationAlert() {
		Alert.alert(
			'Appointment delete',
			`Are you sure you want to delete the appointment for ${this.state.appointment.contact_name} on ${this.state.appointment.date} at ${this.state.appointment.hour}:${this.state.appointment.minute}?`,
			[
				{ text: 'OK', onPress: () => this.deleteAppointment(), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	deleteAppointmentAlert() {
		Alert.alert(
			'Appointment deleted',
			`The appointment for ${this.state.appointment.contact_name} on ${this.state.appointment.date} at ${this.state.appointment.hour}:${this.state.appointment.minute} has been deleted`,
			[
				{ text: 'OK', onPress: () => console.log('appointment deleted'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async saveTreatment() {
		if (this.state.appointmentid === '') {
			Alert.alert(
				'Appointment info',
				'The appointment needs to be saved first',
				[
					{ text: 'OK', onPress: () => this._tabs.goToPage(0), style: 'cancel' }
				],
				{ cancelable: true }
			);
		} else {
			if (this.state.treatment._id === '') {
				const newtreatment = {};
				newtreatment.doctype = 'treatment';
				newtreatment.appointment_id = this.state.appointmentid;
				newtreatment.contact_id = this.state.appointment.contact_id;
				newtreatment.title = this.state.appointment.contact_id;
				const title = this.state.treatment.title.toLowerCase();
				newtreatment.title = title.charAt(0).toUpperCase() + title.slice(1);
				newtreatment.notes = this.state.treatment.notes;
				const savedtreatment = await DBCompanyConnection.post(newtreatment);
				const newrev = savedtreatment.rev;
				this.onChangeTextTreatment(newrev, '_rev');
				this.saveTreatmentAlert('created');
			} else {
				this.state.treatment.contact_id = this.state.appointment.contact_id;
				this.state.treatment.title = this.state.treatment.title.toLowerCase();
				this.state.treatment.title = this.state.treatment.title.charAt(0).toUpperCase() + this.state.treatment.title.slice(1);
				const saveTreatment = await DBCompanyConnection.put(this.state.treatment);
				const newrev = saveTreatment.rev;
				this.onChangeTextTreatment(newrev, '_rev');
				this.saveTreatmentAlert('updated');
			}
		}
	}

	saveTreatmentAlert(saveText) {
		Alert.alert(
			`Treatment ${saveText}`,
			`The treatment ${this.state.treatment.title} for ${this.state.appointment.contact_name} on ${this.state.appointment.date} has been ${saveText}`,
			[
				{ text: 'OK', onPress: () => console.log('appointment created/updated'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	connectCompanyDb(isConnected) {
		this.setState({ showspinner: true });
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getAppointmentInfo();
		}
	}

	appointmentButtons() {
		if (this.state.appointmentid === '') {
			return (
				<ActionButton
					size={40}
					buttonColor="#9DBDF2"
					offsetX={10}
					offsetY={10}
					ref={(btn) => {
						this.floatingBtn = btn;
					}}
					onPress={() => { this.hideKeyboard(); }}
					icon={<IconMaterial name="settings" size={28} color="white" />}
				>
					<ActionButton.Item buttonColor="#00b359" title="Save appointment" onPress={() => { this.saveAppointment(); }}>
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
				offsetY={10}
				ref={(btn) => {
					this.floatingBtn = btn;
				}}
				onPress={() => { this.hideKeyboard(); }}
				icon={<IconMaterial name="settings" size={28} color="white" />}
			>
				<ActionButton.Item buttonColor="#00b359" title="Update appointment" onPress={() => { this.saveAppointment(); }}>
					<IconMaterial name="save" size={28} color="white" />
				</ActionButton.Item>
				<ActionButton.Item buttonColor="#ff4c4c" title="Delete appointment" onPress={() => { this.deleteAppointment(); }}>
					<IconMaterial name="delete" size={28} color="white" />
				</ActionButton.Item>
			</ActionButton>
		);
	}

	treatmentButtons() {
		if (this.state.treatment._id === '') {
			return (
				<ActionButton
					size={40}
					buttonColor="#9DBDF2"
					offsetX={10}
					offsetY={10}
					ref={(btn) => {
						this.floatingBtn = btn;
					}}
					onPress={() => { this.hideKeyboard(); }}
					icon={<IconMaterial name="settings" size={28} color="white" />}
				>
				<ActionButton.Item buttonColor="#00b359" title="Save treatment" onPress={() => { this.saveTreatment(); }}>
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
				onPress={() => { this.hideKeyboard(); }}
				icon={<IconMaterial name="settings" size={28} color="white" />}
			>
				<ActionButton.Item buttonColor="#00b359" title="Update treatment" onPress={() => { this.saveTreatment(); }}>
					<IconMaterial name="save" size={28} color="white" />
				</ActionButton.Item>
				<ActionButton.Item buttonColor="#ff4c4c" title="Delete treatment" onPress={() => { this.deleteTreatment(); }}>
					<IconMaterial name="delete" size={28} color="white" />
				</ActionButton.Item>
			</ActionButton>
		);
	}

	renderRowImages(image) {
		console.log('image');
		console.log(image);
		return (
			null
		);
	}

	renderRowAddresses(address) {
		console.log('address');
		console.log(address);
		if (_.isEmpty(address) !== true) {
			return (
				<ListItem>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
						}}
					>
						<Body style={{ flex: 1 }}>
							{address.label !== '' &&
							<Label>
								{address.label}
								<Text
									style={{
										color: '#AEB1B7'
									}}
								>
									&nbsp;{address.address}
								</Text>
							</Label>
							}
							{address.label === '' &&
							<Label>
								Address
								<Text
									style={{
										color: '#AEB1B7'
									}}
								>
									&nbsp;{address.address}
								</Text>
							</Label>
							}
						</Body>
					</View>
				</ListItem>
			);
		}
		return (null);
	}

	renderRowTelephones(telephone) {
		console.log('telephone');
		console.log(telephone);
		if (_.isEmpty(telephone) !== true) {
			return (
				<ListItem>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
						}}
					>
						<Body style={{ flex: 1 }}>
							{telephone.label !== '' &&
								<Label>
									{telephone.label}
									<Text
										style={{
											color: '#AEB1B7'
										}}
									>
										&nbsp;{telephone.number}
									</Text>
								</Label>
							}
							{telephone.label === '' &&
								<Label>
									Telephone
									<Text
										style={{
											color: '#AEB1B7'
										}}
									>
										&nbsp;{telephone.number}
									</Text>
								</Label>
							}
						</Body>
					</View>
				</ListItem>
			);
		}
		return (null);
	}

	renderRowEmails(email) {
		console.log('email');
		console.log(email);
		if (_.isEmpty(email) !== true) {
			return (
				<ListItem>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
						}}
					>
						<Body style={{ flex: 1 }}>
							{email.label !== '' &&
								<Label>
									{email.label}
									<Text
										style={{
											color: '#AEB1B7'
										}}
									>
										&nbsp;{email.email}
									</Text>
								</Label>
							}
							{email.label === '' &&
								<Label>
									Email
									<Text
										style={{
											color: '#AEB1B7'
										}}
									>
										&nbsp;{email.email}
									</Text>
								</Label>
							}
						</Body>
					</View>
				</ListItem>
			);
		}
		return (null);
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Tabs initialPage={this.currentTab} ref={(c) => { this._tabs = c; }}>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Appointment</Text></TabHeading>}>
						<Content>
							{this.state.showspinner && <Spinner /> }
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									justifyContent: 'center',
								}}
							>
								<DatePicker
									date={this.state.appointment.date}
									mode="date"
									placeholder="Select date"
									format="DD-MM-YYYY"
									confirmBtnText="Ok"
									cancelBtnText="Cancel"
									customStyles={{
										dateIcon: {
											alignItems: 'center',
											alignSelf: 'center'
										},
										dateInput: {
											height: 40,
											borderColor: 'transparent',
											backgroundColor: 'white'
										}
									}}
									onDateChange={(date) => {
										this.onChangeText(date, 'date');
									}}
								/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									justifyContent: 'center',
									paddingLeft: 12,
									paddingRight: 12,
									paddingTop: 5,
								}}
							>
								<IconMaterial
									name="access-time"
									size={20}
									style={{
										paddingTop: 10
									}}
								/>
								<Label
									style={{
										paddingLeft: 12,
										paddingRight: 12,
										fontWeight: 'bold',
										alignItems: 'center',
										alignSelf: 'center',
									}}
								>
									Hour
								</Label>
								<ModalPicker
									data={this.hoursList}
									initValue="H"
									onChange={(option)=>{ this.onChangeText(option, 'hour'); }}>
									<Text
										style={{
											textAlign: 'center',
											paddingTop: 8,
											paddingLeft: 5,
											borderColor: '#C0C0C0',
											borderWidth: 1,
											borderRadius: 6,
											height: 40,
										}}
									>
									{this.state.appointment.hour}
									<MaterialCommunityIcons
										name="chevron-down"
										style={{
											fontSize: 20,
										}}
									/>
									</Text>
								</ModalPicker>
								<Label
									style={{
										paddingLeft: 12,
										paddingRight: 12,
										fontWeight: 'bold',
										alignItems: 'center',
										alignSelf: 'center',
									}}
								>
									Minute
								</Label>
								<ModalPicker

									data={this.minutesList}
									initValue="M"
									onChange={(option)=>{ this.onChangeText(option, 'minute'); }}>
									<Text
										style={{
											textAlign: 'center',
											paddingTop: 8,
											paddingLeft: 5,
											borderColor: '#C0C0C0',
											borderWidth: 1,
											borderRadius: 6,
											height: 40,
										}}
									>
									{this.state.appointment.minute}
									<MaterialCommunityIcons
										name="chevron-down"
										style={{
											fontSize: 20,
										}}
									/>
									</Text>
								</ModalPicker>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									paddingLeft: 12,
									paddingRight: 12,
									paddingTop: 12,
									width: fullWidth
								}}
							>
								<IconMaterial
									name="perm-identity"
									size={20}
									style={{
										paddingTop: 12,
										width: 20
									}}
								/>
								<Label
									style={{
										paddingTop: 12,
										paddingLeft: 12,
										fontWeight: 'bold',
										width: 110
									}}
								>Contact</Label>
								<ModalPicker
									data={this.contactsList}
									initValue="Select contact"
									onChange={(option)=>{ this.onChangeText(option, 'contact_id'); }}>
									<Text
										style={{
											textAlign: 'center',
											paddingTop: 8,
											marginRight: 7,
											paddingLeft: 12,
											borderColor: '#C0C0C0',
											borderWidth: 1,
											borderRadius: 6,
											height: 40,
										}}
									>
									{this.state.appointment.contact_name}
									<MaterialCommunityIcons
										name="chevron-down"
										style={{
											fontSize: 20,
										}}
									/>
									</Text>
								</ModalPicker>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									paddingLeft: 12,
									paddingRight: 12,
									paddingTop: 12,
									width: fullWidth
								}}
							>
								<IconMaterial
									name="supervisor-account"
									size={20}
									style={{
										paddingTop: 12,
										width: 20
									}}
								/>
								<Label
									style={{
										paddingTop: 12,
										paddingLeft: 12,
										fontWeight: 'bold',
										width: 110
									}}
								>Employee</Label>
								<ModalPicker
									data={this.employeesList}
									initValue="Select employee"
									onChange={(option)=>{ this.onChangeText(option, 'employee_id'); }}>
									<Text
										style={{
											textAlign: 'center',
											paddingTop: 8,
											marginRight: 7,
											paddingLeft: 12,
											borderColor: '#C0C0C0',
											borderWidth: 1,
											borderRadius: 6,
											height: 40,
										}}
									>
									{this.state.appointment.employee_alias}
									<MaterialCommunityIcons
										name="chevron-down"
										style={{
											fontSize: 20,
										}}
									/>
									</Text>
								</ModalPicker>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									paddingLeft: 12,
									paddingRight: 12,
									paddingTop: 12,
								}}
							>
								<Label
									style={{
										paddingTop: 12,
										fontWeight: 'bold'
									}}
								>General notes</Label>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									paddingLeft: 12,
									paddingRight: 12,
									paddingTop: 12,
								}}
							>
								<Input
									underlineColorAndroid={'transparent'}
									autoCorrect={false}
									multiline
									numberOfLines={5}
									returnKeyType="done"
									style={{
										backgroundColor: '#fff',
										height: 180,
										borderColor: '#C0C0C0',
										borderWidth: 1,
										borderRadius: 6,
										color: '#424B4F',
										width: fullWidth,
										paddingVertical: 0
									}}
									onChangeText={(text) => {
										this.onChangeText(text, 'notes');
									}}
									value={this.state.appointment.notes}
								/>
							</View>
							<View style={{ height: 60 }} />
						</Content>
						{this.appointmentButtons()}
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Treatment</Text></TabHeading>}>
						<Content>
							{this.state.showspinner && <Spinner /> }
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									justifyContent: 'center',
									paddingTop: 15
								}}
							>
								<Text
									style={{
										fontWeight: 'bold',
									}}
								>
									{this.state.appointment.date}
								</Text>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									justifyContent: 'center',
									paddingTop: 15
								}}
							>
								<Text
									style={{
										fontWeight: 'bold',
										color: 'steelblue'
									}}
								>
									{this.state.appointment.contact_name}
								</Text>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									paddingTop: 15,
									paddingLeft: 12,
									paddingRight: 12
								}}
							>
								<Text
									style={{
										textDecorationLine: 'underline',
								    textDecorationStyle: 'solid',
								    textDecorationColor: 'steelblue',
										color: 'steelblue'
									}}
									onPress={() => { this.treatmentListModalControl(); }}

								>
									Select previous treatment from a list
								</Text>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									paddingTop: 15,
									paddingLeft: 12,
									paddingRight: 12
								}}
							>
								<Input
									underlineColorAndroid={'transparent'}
									autoCorrect={false}
									maxLength={35}
									returnKeyType="done"
									style={{
										backgroundColor: '#fff',
										borderColor: '#C0C0C0',
										borderWidth: 1,
										borderRadius: 6,
										color: '#424B4F',
										width: fullWidth,
										paddingVertical: 0
									}}
									onChangeText={(text) => {
										this.onChangeTextTreatment(text, 'title');
									}}
									value={this.state.treatment.title}
								/>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									paddingLeft: 12,
									paddingRight: 12,
									paddingTop: 12,
								}}
							>
								<Label
									style={{
										paddingTop: 12,
										fontWeight: 'bold'
									}}
								>Treatment notes</Label>
							</View>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									paddingLeft: 12,
									paddingRight: 12,
									paddingTop: 12,
								}}
							>
								<Input
									underlineColorAndroid={'transparent'}
									autoCorrect={false}
									multiline
									numberOfLines={10}
									returnKeyType="done"
									style={{
										backgroundColor: '#fff',
										height: 200,
										borderColor: '#C0C0C0',
										borderWidth: 1,
										borderRadius: 6,
										color: '#424B4F',
										width: fullWidth,
										paddingVertical: 0
									}}
									onChangeText={(text) => {
										this.onChangeTextTreatment(text, 'notes');
									}}
									value={this.state.treatment.notes}
								/>
							</View>
						<View style={{ height: 60 }} />
						</Content>
						{this.treatmentButtons()}
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Gallery</Text></TabHeading>}>
						<Content>
							{this.state.showspinner && <Spinner /> }
							<ListView
								dataSource={this.state.imageslist}
								enableEmptySections
								renderRow={this.renderRowImages.bind(this)}
							/>
						<View style={{ height: 60 }} />
						</Content>
						<ActionButton
							size={40}
							buttonColor="#9DBDF2"
							offsetX={10}
							offsetY={10}
							ref={(btn) => {
								this.floatingBtn = btn;
							}}
							onPress={() => { this.hideKeyboard(); }}
							icon={<IconMaterial name="settings" size={28} color="white" />}
						>
							<ActionButton.Item buttonColor="steelblue" title="Add image" onPress={() => { this.addPhoto(true); }}>
								<IconMaterial name="add-a-photo" size={28} color="white" />
							</ActionButton.Item>
						</ActionButton>
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Contact</Text></TabHeading>}>
						<Content>
							{this.state.showspinner && <Spinner /> }
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									borderBottomWidth: 1,
									borderColor: '#d7d7d6',
								}}
							>
								{this.state.contact.thumbnailPath === '' &&
									<Image
										style={{
											flex: 0.2,
											margin: 12,
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
								{this.state.contact.thumbnailPath !== '' &&
									<Image
										style={{
											flex: 0.2,
											margin: 12,
											width: 80,
									    height: 80,
									    borderRadius: 80/2,
									    borderWidth: 1,
									    borderColor: 'steelblue',
									    backgroundColor: 'transparent',
										}}
										source={{ uri: this.state.contact.thumbnailPath }}>
									</Image>
								}
								<View
									style={{
										flex: 0.7,
										marginTop: 22,
									}}
								>
									<Label>
										Name:
										<Text
											style={{
												color: '#AEB1B7'
											}}
										>
											&nbsp;{this.state.contact.givenName}
										</Text>
									</Label>
									<Label>
										Middle name:
										<Text
											style={{
												color: '#AEB1B7'
											}}
										>
											&nbsp;{this.state.contact.middleName}
										</Text>
									</Label>
									<Label>
										Surname:
										<Text
											style={{
												color: '#AEB1B7'
											}}
										>
											&nbsp;{this.state.contact.familyName}
										</Text>
									</Label>
								</View>
							</View>
							<Item>
								<Label style={{ marginLeft: 12, color: '#000000' }}>Company</Label>
									<Input
										editable={false}
										style={{ marginLeft: 7, color: '#AEB1B7' }}
										value={this.state.contact.company}
									/>
							</Item>
							<Item>
								<Label style={{ marginLeft: 12, color: '#000000' }}>Job title</Label>
									<Input
										editable={false}
										style={{ marginLeft: 7, color: '#AEB1B7' }}
										value={this.state.contact.jobTitle}
									/>
							</Item>
							<ListView
								dataSource={this.state.addresseslist}
								enableEmptySections
								renderRow={this.renderRowAddresses.bind(this)}
							/>
							<ListView
								dataSource={this.state.telephoneslist}
								enableEmptySections
								renderRow={this.renderRowTelephones.bind(this)}
							/>
							<ListView
								dataSource={this.state.emailslist}
								enableEmptySections
								renderRow={this.renderRowEmails.bind(this)}
							/>
						<View style={{ height: 60 }} />
						</Content>
					</Tab>
				</Tabs>
				<FooterMain activeArea="Appointments" />
			</Container>
		);
	}
}

const mapStateToProps = state => {
	return {};
};

export default connect(
	(state) => {
		return state;
	},
	(dispatch) => {
		return {
			dispatch
		};
	}
)(AppointmentsInfo);
