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
import TextField from '../containers/common/TextField';
import ModalPicker from './common/ModalPicker';
import moment from 'moment';

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

const hat = require('hat');

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
		const dsTreatments = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			showspinner: true,
			showspinnertext: 'Loading appointment info, please wait',
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
			treatmentslist: dsTreatments.cloneWithRows([]),
			treatments: [],
			imageslist: dsImages.cloneWithRows([]),
			images: [],
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
		this.userLoggedId = '';
	}

	componentWillMount() {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {
						this.userLoggedId = userLoggedIdValue;
						this.connectCompanyDb(true);
						this._tabs.goToPage(this.currentTab);
					}
				});
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

	async onChangeText(newValue, prop) {
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

	onChangeTreatmentImagesInfo(newValue, prop, imageInfo) {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const newimages = this.state.images;
		for (let i = 0; i < newimages.length; i += 1) {
			if (imageInfo.imageid === newimages[i].imageid) {
				imageInfo.doctype = 'images';
				imageInfo.owner = this.state.appointmentid;
				if (prop === 'notes') {
					newimages[i].notes = newValue;
				}
				if (prop === '_rev') {
					newimages[i]._rev = newValue;
				}
				if (prop === '_id') {
					newimages[i]._id = newValue;
				}
			}
		}
		this.setState({ imageslist: ds.cloneWithRows(newimages), images: newimages });
	}

	onChangeTreatmentInfo(newValue, prop, treatmentInfo) {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const newtreatments = this.state.treatments;
		for (let i = 0; i < newtreatments.length; i += 1) {
			if (treatmentInfo._id) {
				if (treatmentInfo._id === newtreatments[i]._id) {
					if (prop === 'name') {
						newtreatments[i].name = newValue.label;
						newtreatments[i].treatment_id = newValue.value;
						newtreatments[i].duration = newValue.duration;
					}
					if (prop === 'notes') {
						newtreatments[i].notes = newValue;
					}
					if (prop === '_rev') {
						newtreatments[i]._rev = newValue;
					}
				}
			} else {
				if (JSON.stringify(treatmentInfo) === JSON.stringify(newtreatments[i])) {
					if (prop === 'name') {
						newtreatments[i].name = newValue.label;
						newtreatments[i].treatment_id = newValue.value;
						newtreatments[i].duration = newValue.duration;
					}
					if (prop === 'notes') {
						newtreatments[i].notes = newValue;
					}
					if (prop === '_rev') {
						newtreatments[i]._rev = newValue;
					}
				}
			}
		}
		this.setState({ treatmentslist: ds.cloneWithRows(newtreatments), treatments: newtreatments });
	}

	async getAppointmentInfo() {
		this.setState({ showspinner: true });
		const dsTreatments = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsImages = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsAdresses = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsTelephones = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsEmails = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.queryContacts = {
			'selector': {
				'doctype': 'contact',
				'$or': [
					{ 'shareimportedcontacts': { '$eq': true }},
					{ 'sharecreatedcontacts': { '$eq': true }},
					{ 'userid': { '$eq': this.userLoggedId }},
				]
			},
			'fields': []
		};
		const contactInfo = await DBCompanyConnection.find(this.queryContacts);
		this.contactsList = [];
		if (contactInfo.docs.length > 0) {
			for (let c = 0; c < contactInfo.docs.length; c += 1) {
				contactsListObject = {
					key: '',
					value: '',
					label: ''
				};
				contactsListObject.key = contactInfo.docs[c]._rev;
				contactsListObject.value = contactInfo.docs[c]._id;
				contactsListObject.label = contactInfo.docs[c].givenName+' '+contactInfo.docs[c].familyName;
				this.contactsList.push(contactsListObject);
			}
			this.contactsList = _.sortBy(this.contactsList, ['label']);
		}
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
		const queryTreatment = { selector: { doctype: 'treatmentlist' }, };
		const treatmentInfo = await DBCompanyConnection.find(queryTreatment);
		this.treatmentsList = [];
		treatmentsListObject = {
			key: '0',
			value: '',
			name: '',
			duration: ''
		};
		if (treatmentInfo.docs.length > 0) {
			for (let t = 0; t < treatmentInfo.docs.length; t += 1) {
				treatmentsListObject = {
					key: treatmentInfo.docs[t]._rev,
					value: treatmentInfo.docs[t]._id,
					label: treatmentInfo.docs[t].name,
					duration: treatmentInfo.docs[t].duration
				};
				this.treatmentsList.push(treatmentsListObject);
			}
			this.treatmentsList = _.sortBy(this.treatmentsList, ['label']);
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
		if (this.state.appointmentid === '') {
			this.setState({
				appointment: this.state.appointment,
				treatment: this.state.treatment,
				contact: this.state.contact,
				treatmentslist: dsTreatments.cloneWithRows([]),
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
				appointmentInfo.docs[0].contact_name = 'Missing contact';
				if (contactInfo.docs.length > 0) {
					appointmentInfo.docs[0].contact_name = contactInfo.docs[0].givenName +' '+contactInfo.docs[0].familyName;
				}
				const queryEmployee = { selector: { doctype: 'user', _id: appointmentInfo.docs[0].employee_id }, };
				const employeeInfo = await DBCompanyConnection.find(queryEmployee);
				appointmentInfo.docs[0].employee_alias = 'Missing employee';
				if (employeeInfo.docs.length > 0) {
					appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].alias;
					if (employeeInfo.docs[0].alias === '') {
						appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].name;
						if (employeeInfo.docs[0].name === '') {
							appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].email;
						}
					}
				}
				if (this.state.appointmentid !== '') {
					const queryTreatmentsAppointment = { selector: { doctype: 'treatment', appointment_id: this.state.appointmentid }, };
					const treatmentInfo = await DBCompanyConnection.find(queryTreatmentsAppointment);
					if (treatmentInfo.docs.length > 0) {
						this.setState({ treatmentslist: dsTreatments.cloneWithRows(treatmentInfo.docs), treatments: treatmentInfo.docs });
					} else {
						this.setState({ treatmentslist: dsTreatments.cloneWithRows([]), treatments: [] });
					}
				}
				if (this.state.appointmentid !== '') {
					const queryAppointmentImages = { selector: { doctype: 'images', area: 'appointment', owner: this.state.appointmentid }, };
					const appointmentimages = await DBCompanyConnection.find(queryAppointmentImages);
					if (appointmentimages.docs.length > 0) {
						this.setState({ imageslist: dsImages.cloneWithRows(appointmentimages.docs), images: appointmentimages.docs });
					} else {
						this.setState({ imageslist: dsImages.cloneWithRows([]), images: [] });
					}
				}
				if (contactInfo.docs.length > 0) {
					this.setState({
						appointment: appointmentInfo.docs[0],
						contact: contactInfo.docs[0],
						addresseslist: dsAdresses.cloneWithRows(contactInfo.docs[0].postalAddresses),
						telephoneslist: dsTelephones.cloneWithRows(contactInfo.docs[0].phoneNumbers),
						emailslist: dsEmails.cloneWithRows(contactInfo.docs[0].emailAddresses),
					});
					this.setState({ showspinner: false });
				} else {
					this.setState({ appointment: appointmentInfo.docs[0], showspinner: false });
				}
			}
			this.setState({ showspinner: false });
		}
	}

	async saveAppointment() {
		if (this.state.appointmentid === '') {
			const newappointment = {};
			newappointment.doctype = 'appointment';
			newappointment.date = this.state.appointment.date;
			newappointment.hour = this.state.appointment.hour;
			newappointment.minute = this.state.appointment.minute;
			newappointment.contact_id = this.state.appointment.contact_id;
			newappointment.employee_id = this.state.appointment.employee_id;
			newappointment.treatment_duration = '';
			newappointment.treatment_id = '';
			newappointment.notes = this.state.appointment.notes;
			const savedappointment = await DBCompanyConnection.post(newappointment);
			const newrev = savedappointment.rev;
			this.onChangeText(newrev, '_rev');
			this.saveAppointmentAlert('created', savedappointment.id);
		} else {
			const queryAmendments = { selector: { doctype: 'appointmentamended', appointment_id: this.state.appointmentid }, };
			const appointmentAmendedInfo = await DBCompanyConnection.find(queryAmendments);
			if (appointmentAmendedInfo.docs.length > 0) {
				for (let a = 0; a < appointmentAmendedInfo.docs.length; a += 1) {
					appointmentAmendedInfo.docs[a].date = this.state.appointment.date;
					appointmentAmendedInfo.docs[a].employee_id = this.state.appointment.employee_id;
					appointmentAmendedInfo.docs[a].contact_id = this.state.appointment.contact_id;
					const updatedappointmentAmended = await DBCompanyConnection.put(appointmentAmendedInfo.docs[a]);
				}
			}
			const updatedappointment = await DBCompanyConnection.put(this.state.appointment);
			const newrev = updatedappointment.rev;
			this.onChangeText(newrev, '_rev');
			this.saveAppointmentAlert('updated', updatedappointment.id);
		}
	}

	async saveAppointmentAlert(saveText, appointmentid) {
		this.setState({ appointmentid: appointmentid });
		Alert.alert(
			`Appointment ${saveText}`,
			`The appointment for ${this.state.appointment.contact_name} on ${this.state.appointment.date} at ${this.state.appointment.hour}:${this.state.appointment.minute} has been ${saveText}`,
			[
				{ text: 'OK', onPress: () => this.getAppointmentInfo(), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	deleteAppointmentConfirmationAlert() {
		Alert.alert(
			'Appointment delete',
			`Are you sure you want to delete the appointment for ${this.state.appointment.contact_name} on ${this.state.appointment.date} at ${this.state.appointment.hour}:${this.state.appointment.minute}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteAppointment(), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel appointment delete'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async deleteAppointment() {
		const appointmentDeleted = await DBCompanyConnection.remove(this.state.appointment);
		if (this.state.treatments.length > 0) {
			for (let t = 0; t < this.state.treatments.length; t += 1) {
				const treatmentDeleted = await DBCompanyConnection.remove(this.state.treatments[t]);
			}
		}
		if (this.state.images.length > 0) {
			for (let i = 0; i < this.state.images.length; i += 1) {
				const imageDeleted = await DBCompanyConnection.remove(this.state.images[i]);
			}
		}
		const queryAmendments = { selector: { doctype: 'appointmentamended', appointment_id: this.state.appointmentid }, };
		const appointmentAmendedInfo = await DBCompanyConnection.find(queryAmendments);
		if (appointmentAmendedInfo.docs.length > 0) {
			for (let a = 0; a < appointmentAmendedInfo.docs.length; a += 1) {
				const appointmentamendeddeleted = await DBCompanyConnection.remove(appointmentAmendedInfo.docs[a]);
			}
		}
		this.deleteAppointmentAlert();
	}

	deleteAppointmentAlert() {
		Alert.alert(
			'Appointment deleted',
			`The appointment for ${this.state.appointment.contact_name} on ${this.state.appointment.date} at ${this.state.appointment.hour}:${this.state.appointment.minute} has been deleted`,
			[
				{ text: 'OK', onPress: () => Actions.Appointments({ title: 'Appointments' }), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	addTreatment() {
		const treatment = {};
		treatment.doctype = 'treatment';
		treatment.name = '';
		treatment.treatment_id = '';
		treatment.notes = '';
		treatment.appointment_id = this.state.appointmentid;
		treatment.employee_id = this.state.appointment.employee_id;
		treatment.contact_id = this.state.appointment.contact_id;
		treatment.duration = '';
		const dsTreatments = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const newtreatmentlist = this.state.treatments;
		newtreatmentlist.push(treatment);
		this.setState({ treatmentslist: dsTreatments.cloneWithRows(newtreatmentlist), treatments: newtreatmentlist });
	}

	deleteTreatmentConfirmationAlert(treatment) {
		Alert.alert(
			'Treatment delete',
			`Are you sure you want to delete the treatment ${treatment.name.toLowerCase()} for the appointment on ${this.state.appointment.date} at ${this.state.appointment.hour}:${this.state.appointment.minute}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteTreatment(treatment), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel appointment delete'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async deleteTreatment(treatment) {
		for (let t = 0; t < this.state.treatments.length; t += 1) {
			if (this.state.treatments[t]._id === treatment._id) {
				const treatmentDeleted = await DBCompanyConnection.remove(this.state.treatments[t]);
				const queryappointmentamended = { selector: { doctype: 'appointmentamended', appointment_id: this.state.appointment._id, treatment_id: this.state.treatments[t]._id }, };
				this.appointmentamendedinfo = await DBCompanyConnection.find(queryappointmentamended);
				if (this.appointmentamendedinfo.docs.length > 0) {
					const appointmentAmendedDeleted = await DBCompanyConnection.remove(this.appointmentamendedinfo.docs[0]);
				}
				const index = this.state.treatments.indexOf(treatment);
				this.state.treatments.splice(index, 1);
			}
		}
		const dsTreatments = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.setState({ treatments: this.state.treatments, treatmentslist: dsTreatments.cloneWithRows(this.state.treatments) });
		this.deleteTreatmentAlert();
	}

	deleteTreatmentAlert() {
		Alert.alert(
			'Treatment deleted',
			'The treatment has been deleted',
			[
				{ text: 'OK', onPress: () => console.log('treatment deleted'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async saveTreatment(treatment) {
		this.setState({ showspinner: true });
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
			if (_.isEmpty(treatment._id)) {
				const newtreatment = {};
				newtreatment.doctype = 'treatment';
				newtreatment.appointment_id = this.state.appointmentid;
				newtreatment.contact_id = this.state.appointment.contact_id;
				newtreatment.employee_id = this.state.appointment.employee_id;
				newtreatment.notes = treatment.notes;
				newtreatment.name = treatment.name;
				newtreatment.duration = treatment.duration;
				newtreatment.treatment_id = treatment.treatment_id;
				const savedtreatment = await DBCompanyConnection.post(newtreatment);
				const newrev = savedtreatment.rev;
				const newid = savedtreatment.id;
				for (let t = 0; t < this.state.treatments.length; t += 1) {
					if (this.state.treatments[t].treatment_id === newtreatment.treatment_id) {
						if (!this.state.treatments[t]._id) {
							this.state.treatments[t]._id = newid;
							this.state.treatments[t]._rev = newrev;
						}
					}
				}
				const queryAmendments = { selector: { doctype: 'appointmentamended', appointment_id: this.state.appointmentid }, };
				const appointmentAmendedInfo = await DBCompanyConnection.find(queryAmendments);
				this.appointmentAmendedInfo = [];
				if (appointmentAmendedInfo.docs.length > 0) {
					for (let a = 0; a < appointmentAmendedInfo.docs.length; a += 1) {
						appointmentAmendedInfo.docs[a].hour = Math.round(appointmentAmendedInfo.docs[a].hour * 100) / 100;
						if (parseInt(appointmentAmendedInfo.docs[a].minute < 10)) {
							appointmentAmendedInfo.docs[a].minute = Math.round(appointmentAmendedInfo.docs[a].minute * 100) / 100;
						}
						this.appointmentAmendedInfo.push(appointmentAmendedInfo.docs[a]);
					}
				}
				if (this.state.treatments.length > 1) {
					if (this.appointmentAmendedInfo.length > 0) {
						this.appointmentAmendedInfo = _.sortBy(this.appointmentAmendedInfo, ['hour', 'minute']).reverse()
						const newappointmentamended = {};
						newappointmentamended.doctype = 'appointmentamended';
						newappointmentamended.date = this.appointmentAmendedInfo[0].date;
						if (!_.isEmpty(newtreatment.duration)) {
							this.newminutes = parseInt(this.appointmentAmendedInfo[0].minute) + parseInt(newtreatment.duration);
							if (this.newminutes >= 60) {
								this.newhour = parseInt(this.appointmentAmendedInfo[0].hour) + 1;
								this.newminutes = this.newminutes - 60;
							} else {
								this.newhour = parseInt(this.appointmentAmendedInfo[0].hour);
							}
						}
						if (this.newhour < 10) {
							this.newhour = String('0'+this.newhour);
						} else {
							this.newhour = String(this.newhour);
						}
						if (this.newminutes < 10) {
							this.newminutes = String('0'+this.newminutes);
						} else {
							this.newminutes = String(this.newminutes);
						}
						newappointmentamended.hour = this.newhour;
						newappointmentamended.minute = this.newminutes;
						newappointmentamended.appointment_id = this.appointmentAmendedInfo[0].appointment_id;
						newappointmentamended.treatment_id = newid;
						newappointmentamended.treatment_name = newtreatment.name;
						newappointmentamended.treatment_duration = newtreatment.duration;
						newappointmentamended.contact_id = this.state.appointment.contact_id;
						newappointmentamended.employee_id = this.state.appointment.employee_id;
						const savedappointmentamended = await DBCompanyConnection.post(newappointmentamended);
					} else {
						const newappointmentamended = {};
						newappointmentamended.doctype = 'appointmentamended';
						newappointmentamended.date = this.state.appointment.date;
						if (!_.isEmpty(newtreatment.duration)) {
							this.newminutes = parseInt(this.state.appointment.minute) + parseInt(newtreatment.duration);
							if (this.newminutes >= 60) {
								this.newhour = parseInt(this.state.appointment.hour) + 1;
								this.newminutes = this.newminutes - 60;
							} else {
								this.newhour = parseInt(this.state.appointment.hour);
							}
						}
						if (this.newhour < 10) {
							this.newhour = String('0'+this.newhour);
						} else {
							this.newhour = String(this.newhour);
						}
						if (this.newminutes < 10) {
							this.newminutes = String('0'+this.newminutes);
						} else {
							this.newminutes = String(this.newminutes);
						}
						newappointmentamended.hour = this.newhour;
						newappointmentamended.minute = this.newminutes;
						newappointmentamended.appointment_id = this.state.appointment._id;
						newappointmentamended.treatment_id = newid;
						newappointmentamended.treatment_name = newtreatment.name;
						newappointmentamended.treatment_duration = newtreatment.duration;
						newappointmentamended.contact_id = this.state.appointment.contact_id;
						newappointmentamended.employee_id = this.state.appointment.employee_id;
						const savedappointmentamended = await DBCompanyConnection.post(newappointmentamended);
					}
				} else {
					this.state.appointment.treatment_duration = treatment.duration;
					this.state.appointment.treatment_id = treatment._id;
					const updatedappointment = await DBCompanyConnection.put(this.state.appointment);
					const newrev = updatedappointment.rev;
					this.onChangeText(newrev, '_rev');
				}
				const dsTreatments = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
				this.setState({ treatmentslist: dsTreatments.cloneWithRows(this.state.treatments), treatments: this.state.treatments, showspinner: false });
				this.saveTreatmentAlert('created', newtreatment);
			} else {
				const updatedtreatment = await DBCompanyConnection.put(treatment);
				const newrev = updatedtreatment.rev;
				this.queryAppointments = {
					'selector': {
						'$or': [
							{ 'doctype': { '$eq': 'appointment' }},
							{ 'doctype': { '$eq': 'appointmentamended' }},
							{ '_id': { '$eq': this.state.appointment._id }},
							{ 'appointment_id': { '$eq': this.state.appointment._id }},
						]
					},
					'fields': []
				};
				const appointmentsamendedinfo = await DBCompanyConnection.find(this.queryAppointments);
				if (appointmentsamendedinfo.docs.length > 0) {
					for (let a = 0; a < appointmentsamendedinfo.docs.length; a += 1) {
						appointmentsamendedinfo.docs[a].hour = Math.round(appointmentsamendedinfo.docs[a].hour * 100) / 100;
						if (parseInt(appointmentsamendedinfo.docs[a].minute < 10)) {
							appointmentsamendedinfo.docs[a].minute = Math.round(appointmentsamendedinfo.docs[a].minute * 100) / 100;
						}
					}
				}
				appointmentsamendedinfo.docs = _.sortBy(appointmentsamendedinfo.docs, ['hour', 'minute']);
				for (let e = 0; e < appointmentsamendedinfo.docs.length; e += 1) {
					if (appointmentsamendedinfo.docs[e].treatment_id === treatment.treatment_id) {
						e += 1;
						if (!_.isEmpty(appointmentsamendedinfo.docs[e])) {
							if (appointmentsamendedinfo.docs[e].treatment_duration < treatment.duration) {
								this.newminutes = parseInt(appointmentsamendedinfo.docs[e].minute) - (parseInt(appointmentsamendedinfo.docs[e].treatment_duration) - parseInt(treatment.duration));
								if (this.newminutes < 0) {
									this.newhour = parseInt(appointmentsamendedinfo.docs[e].hour) - 1;
									this.newminutes = 60 - this.newminutes;
								} else {
									this.newhour = parseInt(appointmentsamendedinfo.docs[e].hour);
								}
								if (this.newhour < 10) {
									this.newhour = String('0'+this.newhour);
								} else {
									this.newhour = String(this.newhour);
								}
								if (this.newminutes < 10) {
									this.newminutes = String('0'+this.newminutes);
								} else {
									this.newminutes = String(this.newminutes);
								}
							} else if (appointmentsamendedinfo.docs[e].treatment_duration > treatment.duration) {
								this.newminutes = parseInt(appointmentsamendedinfo.docs[e].minute) + (parseInt(appointmentsamendedinfo.docs[e].treatment_duration) + parseInt(treatment.duration));
								if (this.newminutes >= 60) {
									this.newhour = parseInt(appointmentsamendedinfo.docs[e].hour) + 1;
									this.newminutes = this.newminutes - 60;
								} else {
									this.newhour = parseInt(appointmentsamendedinfo.docs[e].hour);
								}
								if (this.newhour < 10) {
									this.newhour = String('0'+this.newhour);
								} else {
									this.newhour = String(this.newhour);
								}
								if (this.newminutes < 10) {
									this.newminutes = String('0'+this.newminutes);
								} else {
									this.newminutes = String(this.newminutes);
								}
							}
							appointmentsamendedinfo.docs[e].hour = this.newhour;
							appointmentsamendedinfo.docs[e].minutes = this.newminutes;
							appointmentsamendedinfo.docs[e].treatment_duration = treatment.duration;
							appointmentsamendedinfo.docs[e].appointment_id = this.state.appointment._id;
							appointmentsamendedinfo.docs[e].treatment_id = treatment.treatment_id;
							appointmentsamendedinfo.docs[e].treatment_name = treatment.name;
							appointmentsamendedinfo.docs[e].contact_id = this.state.appointment.contact_id;
							appointmentsamendedinfo.docs[e].employee_id = this.state.appointment.employee_id;
							const appointmentamendedupdated = await DBCompanyConnection.put(appointmentsamendedinfo.docs[e]);
							const newrev = appointmentamendedupdated.rev;
							this.onChangeTreatmentInfo(newrev, '_rev', treatment);
							this.saveTreatmentAlert('updated', treatment);
							this.setState({ showspinner: false, treatmentslist: dsTreatments.cloneWithRows(appointmentsamendedinfo.docs), treatments: appointmentsamendedinfo.docs });
						}
					}
				}
			}
		}
	}

	saveTreatmentAlert(saveText, treatment) {
		Alert.alert(
			`Treatment ${saveText}`,
			`The treatment ${treatment.name.toLowerCase()} for ${this.state.appointment.contact_name} on ${this.state.appointment.date} has been ${saveText}`,
			[
				{ text: 'OK', onPress: () => console.log('treatment created/updated'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async saveImageAppointment(image) {
		this.setState({ showspinner: true });
		if (this.state.appointmentid === '') {
			Alert.alert(
				'Appointment info',
				'The appointment needs to be created first',
				[
					{ text: 'OK', onPress: () => this._tabs.goToPage(0), style: 'cancel' }
				],
				{ cancelable: true }
			);
		} else {
			if (_.isEmpty(image._id)) {
				const newimage = {};
				newimage.doctype = 'images';
				newimage.area = 'appointment';
				newimage.owner = this.state.appointmentid;
				newimage.notes = image.notes;
				newimage.uri = image.uri;
				newimage.imageid = image.imageid;
				const savedimage = await DBCompanyConnection.post(newimage);
				const newrev = savedimage.rev;
				const newid = savedimage.id;
				this.onChangeTreatmentImagesInfo(newrev, '_rev', newimage);
				this.onChangeTreatmentImagesInfo(newid, '_id', newimage);
				this.saveImageAppointmentAlert('created');
				this.setState({ showspinner: false });
			} else {
				const updatedimage = await DBCompanyConnection.put(image);
				const newrev = updatedimage.rev;
				this.onChangeTreatmentImagesInfo(newrev, '_rev', image);
				this.saveImageAppointmentAlert('updated');
				this.setState({ showspinner: false });
			}
		}
	}

	saveImageAppointmentAlert(saveText) {
		Alert.alert(
			`Treatment image ${saveText}`,
			`The image in the appointment for ${this.state.appointment.contact_name} on ${this.state.appointment.date} has been ${saveText}`,
			[
				{ text: 'OK', onPress: () => console.log('image treatment created/updated'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	deleteImageTreatmentConfirmation(image) {
		Alert.alert(
			'Image treatment',
			`Are you sure you want to delete the image for ${this.state.appointment.contact_name} on ${this.state.appointment.date}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteImageTreatment(image), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel delete appointment image'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async deleteImageTreatment(image) {
		const dsImages = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		for (let i = 0; i < this.state.images.length; i += 1) {
			if (this.state.images[i].imageid === image.imageid) {
				const index = this.state.images.indexOf(image);
				this.state.images.splice(index, 1);
			}
		}
		this.setState({ images: this.state.images, imageslist: dsImages.cloneWithRows(this.state.images) });
		const imageTreatmentDeleted = await DBCompanyConnection.remove(image);
		this.deleteImageTreatmentConfirmationAlert();
	}

	deleteImageTreatmentConfirmationAlert() {
		Alert.alert(
			'Image treatment',
			'The image has been deleted',
			[
				{ text: 'Ok', onPress: () => console.log('cancel delete appointment'), style: 'cancel' }
			],
			{ cancelable: true }
		);
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
					onPress={() => { Keyboard.dismiss(); }}
					icon={<IconMaterial name="settings" size={28} color="white" />}
				>
					<ActionButton.Item buttonColor="#8fbc8f" title="Save appointment" onPress={() => { this.saveAppointment(); }}>
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
				onPress={() => { Keyboard.dismiss(); }}
				icon={<IconMaterial name="settings" size={28} color="white" />}
			>
				<ActionButton.Item buttonColor="#8fbc8f" title="Update appointment" onPress={() => { this.saveAppointment(); }}>
					<IconMaterial name="save" size={28} color="white" />
				</ActionButton.Item>
				<ActionButton.Item buttonColor="#f08080" title="Delete appointment" onPress={() => { this.deleteAppointmentConfirmationAlert(); }}>
					<IconMaterial name="delete" size={28} color="white" />
				</ActionButton.Item>
			</ActionButton>
		);
	}

	treatmentButtons() {
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
				<ActionButton.Item buttonColor="steelblue" title="Add treatment" onPress={() => { this.addTreatment(); }}>
					<MaterialCommunityIcons name="plus" size={28} color="white" />
				</ActionButton.Item>
			</ActionButton>
		);
	}

	choosePhoto(cropit) {
		ImagePicker.openPicker({
			cropping: cropit,
			width: 400,
			height: 400,
			includeBase64: true
		}).then((imageInfo) => {
			const image = {};
			image.uri = `data:${imageInfo.mime};base64,${imageInfo.data}`;
			image.notes = '';
			image.doctype = 'images';
			image.area = 'appointment';
			image.owner = this.state.appointmentid;
			const newHatId = hat();
			image.imageid = newHatId;
			const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
			const newimage = this.state.images;
			newimage.push(image);
			this.setState({ imageslist: ds.cloneWithRows(newimage), images: newimage });
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
			const image = {};
			image.uri = `data:${imageInfo.mime};base64,${imageInfo.data}`;
			image.notes = '';
			image.doctype = 'images';
			image.area = 'appointment';
			image.owner = this.state.appointmentid;
			const newHatId = hat();
			image.imageid = newHatId;
			const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
			const newimage = this.state.images;
			newimage.push(image);
			this.setState({ imageslist: ds.cloneWithRows(newimage), images: newimage });
		}).catch('error', (error) => {
			Alert.alert(
				'Image upload error',
				error.message,
				[
					{ text: 'Ok', onPress: () => console.log('error upload image'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		});
	}

	renderRowTreatments(treatment) {
		this.treatmentLabel = `Treatment (${treatment.duration} min)`;
		if (treatment.duration === '') {
			this.treatmentLabel = 'Treatment';
		}
		return (
			<View
				style={{
					borderColor: 'steelblue',
					borderBottomWidth: 0.5,
					paddingBottom: 15,
					paddingTop: 15
				}}
			>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						width: fullWidth,
						paddingHorizontal: 12,
					}}
				>
					<ModalPicker data={this.treatmentsList} label={this.treatmentLabel} initValue={treatment.name} onChange={(option)=>{ this.onChangeTreatmentInfo(option, 'name', treatment); }} />
				</View>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						paddingLeft: 12,
						paddingRight: 12,
					}}
				>
					<Text note
						style={{
							paddingLeft: 7,
							color: '#666666'
						}}
					>Notes</Text>
				</View>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						paddingLeft: 12,
						paddingRight: 60,
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
							height: 80,
							borderColor: '#C0C0C0',
							borderWidth: 1,
							borderRadius: 6,
							color: '#424B4F',
							width: fullWidth,
							paddingVertical: 0,
						}}
						onChangeText={(text) => {
							this.onChangeTreatmentInfo(text, 'notes', treatment);
						}}
						value={treatment.notes}
					/>
				</View>
				<ActionButton size={40} icon={<IconMaterial name="save" size={28} color="white" />} buttonColor="#8fbc8f" offsetX={10} offsetY={60} onPress={() => { this.saveTreatment(treatment); }} />
				{treatment._id && <ActionButton size={40} icon={<IconMaterial name="delete" size={28} color="white" />} buttonColor="#f08080" offsetX={10} offsetY={10} onPress={() => { this.deleteTreatmentConfirmationAlert(treatment); }} />}
			</View>
		);
	}

	renderRowImages(image) {
		return (
			<View
				style={{ paddingTop: 10, paddingBottom: 10, borderColor: 'steelblue', borderBottomWidth: 0.5 }}
			>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
					}}
				>
					<Body style={{ flex: 0.3 }}>
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								paddingTop: 3
							}}
						>
						<Image style={{ width: 100, height: 120 }} source={{ uri: image.uri }} />
						</View>
					</Body>			
					<Body style={{ flex: 0.7, flexDirection: 'row' }}>
						<View
							style={{
								flex: 0.7,
								flexDirection: 'row',
								paddingTop: 3,
							}}
						>
							<Input
								placeholder="Notes"
								underlineColorAndroid={'transparent'}
								autoCorrect={false}
								multiline
								numberOfLines={5}
								returnKeyType="done"
								style={{
									backgroundColor: '#fff',
									height: 120,
									borderColor: '#C0C0C0',
									borderWidth: 1,
									borderRadius: 6,
									color: '#424B4F',
									width: fullWidth,
									paddingVertical: 0
								}}
								onChangeText={(text) => {
									this.onChangeTreatmentImagesInfo(text, 'notes', image);
								}}
								value={image.notes}
							/>
							<View style={{ flex: 0.3 }}>
								<ActionButton size={40} icon={<IconMaterial name="save" size={28} color="white" />} buttonColor="#8fbc8f" offsetX={10} offsetY={58} onPress={() => { this.saveImageAppointment(image); }} />
								{image._id && <ActionButton size={40} icon={<IconMaterial name="delete" size={28} color="white" />} buttonColor="#f08080" offsetX={10} offsetY={5} onPress={() => { this.deleteImageTreatmentConfirmation(image); }} />}
							</View>
						</View>
					</Body>
				</View>
			</View>
		);
	}

	renderRowAddresses(address) {
		address.label = address.label.charAt(0).toUpperCase() + address.label.slice(1);
		if (_.isEmpty(address) !== true) {
			return (
				<ListItem style={{ borderColor: 'transparent' }}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
						}}
					>
						<Body style={{ flex: 1 }}>
							<Text note style={{ color: 'black' }}>{address.label}</Text>
							<Text note>Street: {address.street}</Text>
							<Text note>Postcode: {address.postCode}</Text>
							<Text note>Region: {address.region}</Text>
							<Text note>City: {address.city}</Text>
							<Text note>State: {address.state}</Text>
							<Text note>Country: {address.country}</Text>
						</Body>
					</View>
				</ListItem>
			);
		}
		return (null);
	}

	renderRowTelephones(telephone) {
		if (_.isEmpty(telephone) !== true) {
			telephone.label = telephone.label.charAt(0).toUpperCase() + telephone.label.slice(1);
			return (
				<ListItem style={{ borderColor: 'transparent' }}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
						}}
					>
						<Body style={{ flex: 1 }}>
							<Text note style={{ color: 'black' }}>{telephone.label}</Text>
							<Text note>Number: {telephone.number}</Text>
						</Body>
					</View>
				</ListItem>
			);
		}
		return (null);
	}

	renderRowEmails(email) {
		if (_.isEmpty(email) !== true) {
			email.label = email.label.charAt(0).toUpperCase() + email.label.slice(1);
			return (
				<ListItem style={{ borderColor: 'transparent' }}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
						}}
					>
						<Body style={{ flex: 1 }}>
							<Text note style={{ color: 'black' }}>{email.label}</Text>
							<Text note>Email: {email.email}</Text>
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
											fontWeight: 'bold',
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
										paddingLeft: 40,
										paddingRight: 40,
									}}
								>
									<IconMaterial
										name="access-time"
										size={20}
										style={{
											paddingTop: 25
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
									<ModalPicker data={this.hoursList} label="" initValue={this.state.appointment.hour} onChange={(option)=>{ this.onChangeText(option, 'hour'); }} />
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
									<ModalPicker data={this.minutesList} label="" initValue={this.state.appointment.minute} onChange={(option)=>{ this.onChangeText(option, 'minute'); }} />
								</View>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										paddingLeft: 12,
										paddingRight: 12,
										width: fullWidth
									}}
								>
									<IconMaterial
										name="perm-identity"
										size={20}
										style={{
											paddingTop: 25,
											width: 20
										}}
									/>
									<Label
										style={{
											paddingTop: 25,
											paddingLeft: 12,
											fontWeight: 'bold',
											width: 110
										}}
									>Contact</Label>
									<ModalPicker data={this.contactsList} label="" initValue={this.state.appointment.contact_name} onChange={(option)=>{ this.onChangeText(option, 'contact_id'); }} />
								</View>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										paddingLeft: 12,
										paddingRight: 12,
										width: fullWidth
									}}
								>
									<IconMaterial
										name="supervisor-account"
										size={20}
										style={{
											paddingTop: 25,
											width: 20
										}}
									/>
									<Label
										style={{
											paddingTop: 25,
											paddingLeft: 12,
											fontWeight: 'bold',
											width: 110
										}}
									>Staff</Label>
									<ModalPicker data={this.employeesList} label="" initValue={this.state.appointment.employee_alias} onChange={(option)=>{ this.onChangeText(option, 'employee_id'); }} />
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
											height: 150,
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
							</View>
							}
							<View style={{ height: 60 }} />
						</Content>
						{this.appointmentButtons()}
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Treatment</Text></TabHeading>}>
						<View style={{ padding: 10, borderColor: 'steelblue', borderBottomWidth: 2 }}>
							<Text
								style={{
									fontWeight: 'bold',
									justifyContent: 'center',
									alignItems: 'center',
									alignSelf: 'center'
								}}
							>
								{this.state.appointment.date} - {this.state.appointment.contact_name}
							</Text>
						</View>
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
											fontWeight: 'bold',
										}}
									>{this.state.showspinnertext}</Text>
								</View>
							}
							{this.state.showspinner === false &&
								<ListView
									dataSource={this.state.treatmentslist}
									enableEmptySections
									renderRow={this.renderRowTreatments.bind(this)}
								/>
							}
							<View style={{ height: 40 }} />
						</Content>
						{this.treatmentButtons()}
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Gallery</Text></TabHeading>}>
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
											fontWeight: 'bold',
										}}
									>{this.state.showspinnertext}</Text>
								</View>
							}
							{this.state.showspinner === false &&
								<ListView
									dataSource={this.state.imageslist}
									enableEmptySections
									renderRow={this.renderRowImages.bind(this)}
								/>
							}
							<View style={{ height: 40 }} />
						</Content>
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
							<ActionButton.Item buttonColor="#293E6A" title="Choose image from library" onPress={() => { this.choosePhoto(true); }}>
								<IconMaterial name="photo-library" size={28} color="white" />
							</ActionButton.Item>
							<ActionButton.Item buttonColor="steelblue" title="Add image" onPress={() => { this.addPhoto(true); }}>
								<IconMaterial name="add-a-photo" size={28} color="white" />
							</ActionButton.Item>
						</ActionButton>
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Contact</Text></TabHeading>}>
						{this.state.showspinner === false && <Content>
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
										source={require('../img/contacts.png')}
									/>
								}
								{this.state.contact.thumbnailPath !== '' &&
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
										source={{ uri: this.state.contact.thumbnailPath }}
									/>
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
							{this.state.contact.company !== '' &&
								<Item>
									<Label style={{ marginLeft: 12, color: '#000000' }}>Company</Label>
										<Input
											editable={false}
											style={{ marginLeft: 7, color: '#AEB1B7' }}
											value={this.state.contact.company}
										/>
								</Item>
							}
							{this.state.contact.jobTitle !== '' &&
								<Item>
									<Label style={{ marginLeft: 12, color: '#000000' }}>Job title</Label>
										<Input
											editable={false}
											style={{ marginLeft: 7, color: '#AEB1B7' }}
											value={this.state.contact.jobTitle}
										/>
								</Item>
							}
							<Label style={{ paddingLeft: 15, paddingTop: 15 }}>Address(es)</Label>
							<View style={{ borderBottomWidth: 1, borderColor: '#d7d7d6', }}>
								<ListView
									dataSource={this.state.addresseslist}
									enableEmptySections
									renderRow={this.renderRowAddresses.bind(this)}
								/>
							</View>
							<Label style={{ paddingLeft: 15, paddingTop: 15 }}>Telephone(s)</Label>
							<View style={{ borderBottomWidth: 1, borderColor: '#d7d7d6', }}>
								<ListView
									dataSource={this.state.telephoneslist}
									enableEmptySections
									renderRow={this.renderRowTelephones.bind(this)}
								/>
							</View>
							<Label style={{ paddingLeft: 15, paddingTop: 15 }}>Email(s)</Label>
							<View style={{ borderBottomWidth: 1, borderColor: '#d7d7d6', }}>
								<ListView
									dataSource={this.state.emailslist}
									enableEmptySections
									renderRow={this.renderRowEmails.bind(this)}
								/>
							</View>
							<View style={{ height: 40 }} />
						</Content>}
					</Tab>
				</Tabs>
				{/* <FooterMain activeArea="Appointments" /> */}
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
