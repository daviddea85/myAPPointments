import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Dimensions, AsyncStorage, ListView, View, TextInput, Keyboard, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab, Tabs, Tab, TabHeading, Badge, Right, Label, Input, Spinner  } from 'native-base';
import { Actions } from 'react-native-router-flux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
import PouchDB from 'pouchdb-react-native';
import DatePicker from 'react-native-datepicker';
import { Col, Row, Grid } from 'react-native-easy-grid';
import ActionButton from 'react-native-action-button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PopupDialog, { DialogTitle, DialogButton, SlideAnimation, ScaleAnimation, FadeAnimation } from 'react-native-popup-dialog';
import ModalPicker from './common/ModalPicker';
import moment from 'moment';
import { CheckBox } from 'react-native-elements';

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;

class Dashboard extends Component {

	constructor(props) {
		super(props);
		this.mainTabs = null;
		this.state = {
			showspinner: false,
			showspinnertext: 'Loading appointments, please wait',
			searchItem: '',
			todaysDate: this.props.appointmentsdate || '',
			weekDate: '',
			// weekDate: '20-11-17 - 26-11-17'
			dialogShow: false,
			employeesSelected: this.props.employeesSelected || [],
			employeesSelectedCount: '0',
			appointment: {},
			appointmentinfo: {
				_id: '',
				doctype: 'appointment',
				date: '',
				hour: '',
				minute: '',
				contact_id: '',
				contact_name: '',
				employee_id: '',
				employee_alias: '',
				notes: ''
			},
			employeesList: [],
			contactsList: [],
			employeesListText: 'Select employee(s)',
			hours: {
				one: false,
				two: false,
				three: false,
				four: false,
				five: false,
				six: false,
				seven: false,
				eight: false,
				nine: false,
				ten: false,
				eleven: false,
				twelve: false,
				thirteen: false,
				fourteen: false,
				fiveteen: false,
				sixteen: false,
				seventeen: false,
				eighteen: false,
				nineteen: false,
				twenty: false,
				twentyone: false,
				twentytwo: false,
				twentythree: false,
				twentyfour: false
			},
			days: {
				monday: false,
				tuesday: false,
				wednesday: false,
				thursday: false,
				friday: false,
				saturday: false,
				sunday: false
			}
		};
		this.showScaleAnimationDialog = this.showScaleAnimationDialog.bind(this);
		this.companyName = '';
		this.companyDatabase = '';
		this.accessType = '';
		this.userLoggedId = '';
		this.treatmentslist = '';
		this.appointmentdetails = {
			_id: '',
			doctype: 'appointment',
			date: '',
			hour: '',
			minute: '',
			contact_id: '',
			contact_name: '',
			employee_id: '',
			employee_alias: '',
			notes: ''
		};
		this.treatmentslistinfo = [];
		this.eight = [];
		this.nine = [];
		this.ten = [];
		this.eleven = [];
		this.twelve = [];
		this.thirteen = [];
		this.fourteen = [];
		this.fiveteen = [];
		this.sixteen = [];
		this.seventeen = [];
		this.eighteen = [];
		this.nineteen = [];
		this.twenty = [];
		this.twentyone = [];
	}

	componentWillMount() {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {
						this.userLoggedId = userLoggedIdValue;
						if (_.isEmpty(this.state.todaysDate)) {
							this.setState({ todaysDate: moment().format('DD-MM-YYYY'), userSelected: this.userSelected });
						} else {
							this.setState({ todaysDate: this.state.todaysDate, userSelected: this.userSelected });
						}
						this.connectCompanyDb(true);
						// this._tabs.goToPage(this.currentTab);
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
			this.getAppointmentTreatments();
		}
	}

	componentDidMount() {}

	componentDidUpdate() {}

	componentWillUnmount() {}

	connectCompanyDb(isConnected) {
		this.setState({ showspinner: true });
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.showData();
		}
	}

	async getAppointmentTreatments() {
		this.treatmentslist = '';
		const queryTreatmentsAppointment = { selector: { doctype: 'treatment', appointment_id: this.state.appointment._id }, };
		const treatmentInfo = await DBCompanyConnection.find(queryTreatmentsAppointment);
		for (let t = 0; t < treatmentInfo.docs.length; t += 1) {
			if (this.treatmentslist === '') {
				this.treatmentslist = `${treatmentInfo.docs[t].name}`;
			} else {
				this.treatmentslist = `${this.treatmentslist}, ${treatmentInfo.docs[t].name}`;
			}
		}
		this.treatmentslistinfo = treatmentInfo.docs;
		this.setState({ appointment: this.state.appointment });
	}

	async showData(dateValue) {
		
		this.eight = [];
		this.nine = [];
		this.ten = [];
		this.eleven = [];
		this.twelve = [];
		this.thirteen = [];
		this.fourteen = [];
		this.fiveteen = [];
		this.sixteen = [];
		this.seventeen = [];
		this.eighteen = [];
		this.nineteen = [];
		this.twenty = [];
		this.twentyone = [];
		if (dateValue) {
			this.state.todaysDate = dateValue;
		}
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
		if (this.state.employeesSelected.length > 0) {
			this.queryAppointments = {
				'selector': {
					'doctype': 'appointment',
					'date': this.state.todaysDate,
				},
				'fields': []
			};
			const appointmentslist = await DBCompanyConnection.find(this.queryAppointments);
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
			this.eightObject = {
				time: true,
				key: '08:00',
				label: '08:00',
				value: '08:00',
				appointment: ''
			};
			this.eight.push(this.eightObject);
			this.nineObject = {
				time: true,
				key: '09:00',
				label: '09:00',
				value: '09:00',
				appointment: ''
			};
			this.nine.push(this.nineObject);
			this.tenObject = {
				time: true,
				key: '10:00',
				label: '10:00',
				value: '10:00',
				appointment: ''
			};
			this.ten.push(this.tenObject);
			this.elevenObject = {
				time: true,
				key: '11:00',
				label: '11:00',
				value: '11:00',
				appointment: ''
			};
			this.eleven.push(this.elevenObject);
			this.twelveObject = {
				time: true,
				key: '12:00',
				label: '12:00',
				value: '12:00',
				appointment: ''
			};
			this.twelve.push(this.twelveObject);
			this.thirteenObject = {
				time: true,
				key: '13:00',
				label: '13:00',
				value: '13:00',
				appointment: ''
			};
			this.thirteen.push(this.thirteenObject);
			this.fourteenObject = {
				time: true,
				key: '14:00',
				label: '14:00',
				value: '14:00',
				appointment: ''
			};
			this.fourteen.push(this.fourteenObject);
			this.fiveteenObject = {
				time: true,
				key: '15:00',
				label: '15:00',
				value: '15:00',
				appointment: ''
			};
			this.fiveteen.push(this.fiveteenObject);
			this.sixteenObject = {
				time: true,
				key: '16:00',
				label: '16:00',
				value: '16:00',
				appointment: ''
			};
			this.sixteen.push(this.sixteenObject);
			this.seventeenObject = {
				time: true,
				key: '17:00',
				label: '17:00',
				value: '17:00',
				appointment: ''
			};
			this.seventeen.push(this.seventeenObject);
			this.eighteenObject = {
				time: true,
				key: '18:00',
				label: '18:00',
				value: '18:00',
				appointment: ''
			};
			this.eighteen.push(this.eighteenObject);
			this.nineteenObject = {
				time: true,
				key: '19:00',
				label: '19:00',
				value: '19:00',
				appointment: ''
			};
			this.nineteen.push(this.nineteenObject);
			this.twentyObject = {
				time: true,
				key: '20:00',
				label: '20:00',
				value: '20:00',
				appointment: ''
			};
			this.twenty.push(this.twentyObject);
			this.twentyoneObject = {
				time: true,
				key: '21:00',
				label: '21:00',
				value: '21:00',
				appointment: ''
			};
			this.twentyone.push(this.twentyoneObject);
			if (appointmentslist.docs.length > 0) {
				for (let a = 0; a < appointmentslist.docs.length; a += 1) {
					this.queryContacts = {
						'selector': {
							'doctype': 'contact',
							'_id': appointmentslist.docs[a].contact_id,
						},
						'fields': []
					};
					const contactinfo = await DBCompanyConnection.find(this.queryContacts);
					if (contactinfo.docs.length > 0) {
						appointmentslist.docs[a].contact_name = contactinfo.docs[0].givenName + ' ' + contactinfo.docs[0].familyName;
					}
					const queryEmployee = { selector: { doctype: 'user', _id: appointmentslist.docs[a].employee_id }, };
					const employeeInfo = await DBCompanyConnection.find(queryEmployee);
					if (employeeInfo.docs.length > 0) {
						if (_.isEmpty(appointmentslist.docs[a].employee_alias)) {
							appointmentslist.docs[a].employee_alias = employeeInfo.docs[0].alias;
							if (appointmentslist.docs[a].alias === '') {
								appointmentslist.docs[a].employee_alias = employeeInfo.docs[0].name;
								if (appointmentslist.docs[a].name === '') {
									appointmentslist.docs[a].employee_alias = employeeInfo.docs[0].email;
								}
							}
						}
					}
				}
				if (this.state.employeesSelected.length > 0) {
					for (let em = 0; em < this.state.employeesSelected.length; em += 1) {
						if (this.state.employeesSelected[em].key !== 'employee') {
							this.appointmentseight = _.filter(appointmentslist.docs, { hour: '08', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentseight.length > 0) {
								this.eightObject = {};
								this.eightObject.time = false,
								this.eightObject.key = this.state.employeesSelected[em].key;
								this.eightObject.label = this.appointmentseight[0].contact_name;
								this.eightObject.value = this.appointmentseight[0]._id;
								this.eightObject.appointment = [];
								this.eightObject.appointment.push(this.appointmentseight[0]);
								this.eight.push(this.eightObject);
							} else {
								this.eightObject = {};
								this.eightObject.time = false,
								this.eightObject.key = '';
								this.eightObject.label = '';
								this.eightObject.value = '';
								this.eightObject.appointment = [];
								this.eight.push(this.eightObject);
							}
							this.appointmentsnine = _.filter(appointmentslist.docs, { hour: '09', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsnine.length > 0) {
								this.nineObject = {};
								this.nineObject.time = false,
								this.nineObject.key = this.state.employeesSelected[em].key;
								this.nineObject.label = this.appointmentsnine[0].contact_name;
								this.nineObject.value = this.appointmentsnine[0]._id;
								this.nineObject.appointment = [];
								this.nineObject.appointment.push(this.appointmentsnine[0]);
								this.nine.push(this.nineObject);
							} else {
								this.nineObject = {};
								this.nineObject.time = false,
								this.nineObject.key = '';
								this.nineObject.label = '';
								this.nineObject.value = '';
								this.nineObject.appointment = [];
								this.nine.push(this.nineObject);
							}
							this.appointmentsten = _.filter(appointmentslist.docs, { hour: '10', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsten.length > 0) {
								this.tenObject = {};
								this.tenObject.time = false,
								this.tenObject.key = this.state.employeesSelected[em].key;
								this.tenObject.label = this.appointmentsten[0].contact_name;
								this.tenObject.value = this.appointmentsten[0]._id;
								this.tenObject.appointment = [];
								this.tenObject.appointment.push(this.appointmentsten[0]);
								this.ten.push(this.tenObject);
							} else {
								this.tenObject = {};
								this.tenObject.time = false,
								this.tenObject.key = '';
								this.tenObject.label = '';
								this.tenObject.value = '';
								this.tenObject.appointment = [];
								this.ten.push(this.tenObject);
							}
							this.appointmentseleven = _.filter(appointmentslist.docs, { hour: '11', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentseleven.length > 0) {
								this.elevenObject = {};
								this.elevenObject.time = false,
								this.elevenObject.key = this.state.employeesSelected[em].key;
								this.elevenObject.label = this.appointmentseleven[0].contact_name;
								this.elevenObject.value = this.appointmentseleven[0]._id;
								this.elevenObject.appointment = [];
								this.elevenObject.appointment.push(this.appointmentseleven[0]);
								this.eleven.push(this.elevenObject);
							} else {
								this.elevenObject = {};
								this.elevenObject.time = false,
								this.elevenObject.key = '';
								this.elevenObject.label = '';
								this.elevenObject.value = '';
								this.elevenObject.appointment = [];
								this.eleven.push(this.elevenObject);
							}
							this.appointmentstwelve = _.filter(appointmentslist.docs, { hour: '12', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentstwelve.length > 0) {
								this.twelveObject = {};
								this.twelveObject.time = false,
								this.twelveObject.key = this.state.employeesSelected[em].key;
								this.twelveObject.label = this.appointmentstwelve[0].contact_name;
								this.twelveObject.value = this.appointmentstwelve[0]._id;
								this.twelveObject.appointment = [];
								this.twelveObject.appointment.push(this.appointmentstwelve[0]);
								this.twelve.push(this.twelveObject);
							} else {
								this.twelveObject = {};
								this.twelveObject.time = false,
								this.twelveObject.key = '';
								this.twelveObject.label = '';
								this.twelveObject.value = '';
								this.twelveObject.appointment = [];
								this.twelve.push(this.twelveObject);
							}
							this.appointmentsthirteen = _.filter(appointmentslist.docs, { hour: '13', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsthirteen.length > 0) {
								this.thirteenObject = {};
								this.thirteenObject.time = false,
								this.thirteenObject.key = this.state.employeesSelected[em].key;
								this.thirteenObject.label = this.appointmentsthirteen[0].contact_name;
								this.thirteenObject.value = this.appointmentsthirteen[0]._id;
								this.thirteenObject.appointment = [];
								this.thirteenObject.appointment.push(this.appointmentsthirteen[0]);
								this.thirteen.push(this.thirteenObject);
							} else {
								this.thirteenObject = {};
								this.thirteenObject.time = false,
								this.thirteenObject.key = '';
								this.thirteenObject.label = '';
								this.thirteenObject.value = '';
								this.thirteenObject.appointment = [];
								this.thirteen.push(this.thirteenObject);
							}
							this.appointmentsfourteen = _.filter(appointmentslist.docs, { hour: '14', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsfourteen.length > 0) {
								this.fourteenObject = {};
								this.fourteenObject.time = false,
								this.fourteenObject.key = this.state.employeesSelected[em].key;
								this.fourteenObject.label = this.appointmentsfourteen[0].contact_name;
								this.fourteenObject.value = this.appointmentsfourteen[0]._id;
								this.fourteenObject.appointment = [];
								this.fourteenObject.appointment.push(this.appointmentsfourteen[0]);
								this.fourteen.push(this.fourteenObject);
							} else {
								this.fourteenObject = {};
								this.fourteenObject.time = false,
								this.fourteenObject.key = '';
								this.fourteenObject.label = '';
								this.fourteenObject.value = '';
								this.fourteenObject.appointment = [];
								this.fourteen.push(this.fourteenObject);
							}
							this.appointmentsfiveteen = _.filter(appointmentslist.docs, { hour: '15', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsfiveteen.length > 0) {
								this.fiveteenObject = {};
								this.fiveteenObject.time = false,
								this.fiveteenObject.key = this.state.employeesSelected[em].key;
								this.fiveteenObject.label = this.appointmentsfiveteen[0].contact_name;
								this.fiveteenObject.value = this.appointmentsfiveteen[0]._id;
								this.fiveteenObject.appointment = [];
								this.fiveteenObject.appointment.push(this.appointmentsfiveteen[0]);
								this.fiveteen.push(this.fiveteenObject);
							} else {
								this.fiveteenObject = {};
								this.fiveteenObject.time = false,
								this.fiveteenObject.key = '';
								this.fiveteenObject.label = '';
								this.fiveteenObject.value = '';
								this.fiveteenObject.appointment = [];
								this.fiveteen.push(this.fiveteenObject);
							}
							this.appointmentssixteen = _.filter(appointmentslist.docs, { hour: '16', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentssixteen.length > 0) {
								this.sixteenObject = {};
								this.sixteenObject.time = false,
								this.sixteenObject.key = this.state.employeesSelected[em].key;
								this.sixteenObject.label = this.appointmentssixteen[0].contact_name;
								this.sixteenObject.value = this.appointmentssixteen[0]._id;
								this.sixteenObject.appointment = [];
								this.sixteenObject.appointment.push(this.appointmentssixteen[0]);
								this.sixteen.push(this.sixteenObject);
							} else {
								this.sixteenObject = {};
								this.sixteenObject.time = false,
								this.sixteenObject.key = '';
								this.sixteenObject.label = '';
								this.sixteenObject.value = '';
								this.sixteenObject.appointment = [];
								this.sixteen.push(this.sixteenObject);
							}
							this.appointmentsseventeen = _.filter(appointmentslist.docs, { hour: '17', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsseventeen.length > 0) {
								this.seventeenObject = {};
								this.seventeenObject.time = false,
								this.seventeenObject.key = this.state.employeesSelected[em].key;
								this.seventeenObject.label = this.appointmentsseventeen[0].contact_name;
								this.seventeenObject.value = this.appointmentsseventeen[0]._id;
								this.seventeenObject.appointment = [];
								this.seventeenObject.appointment.push(this.appointmentsseventeen[0]);
								this.seventeen.push(this.seventeenObject);
							} else {
								this.seventeenObject = {};
								this.seventeenObject.time = false,
								this.seventeenObject.key = '';
								this.seventeenObject.label = '';
								this.seventeenObject.value = '';
								this.seventeenObject.appointment = [];
								this.seventeen.push(this.seventeenObject);
							}
							this.appointmentseighteen = _.filter(appointmentslist.docs, { hour: '18', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentseighteen.length > 0) {
								this.eighteenObject = {};
								this.eighteenObject.time = false,
								this.eighteenObject.key = this.state.employeesSelected[em].key;
								this.eighteenObject.label = this.appointmentseighteen[0].contact_name;
								this.eighteenObject.value = this.appointmentseighteen[0]._id;
								this.eighteenObject.appointment = [];
								this.eighteenObject.appointment.push(this.appointmentseighteen[0]);
								this.eighteen.push(this.eighteenObject);
							} else {
								this.eighteenObject = {};
								this.eighteenObject.time = false,
								this.eighteenObject.key = '';
								this.eighteenObject.label = '';
								this.eighteenObject.value = '';
								this.eighteenObject.appointment = [];
								this.eighteen.push(this.eighteenObject);
							}
							this.appointmentsnineteen = _.filter(appointmentslist.docs, { hour: '19', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsnineteen.length > 0) {
								this.nineteenObject = {};
								this.nineteenObject.time = false,
								this.nineteenObject.key = this.state.employeesSelected[em].key;
								this.nineteenObject.label = this.appointmentsnineteen[0].contact_name;
								this.nineteenObject.value = this.appointmentsnineteen[0]._id;
								this.nineteenObject.appointment = [];
								this.nineteenObject.appointment.push(this.appointmentsnineteen[0]);
								this.nineteen.push(this.nineteenObject);
							} else {
								this.nineteenObject = {};
								this.nineteenObject.time = false,
								this.nineteenObject.key = '';
								this.nineteenObject.label = '';
								this.nineteenObject.value = '';
								this.nineteenObject.appointment = [];
								this.nineteen.push(this.nineteenObject);
							}
							this.appointmentstwenty = _.filter(appointmentslist.docs, { hour: '20', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentstwenty.length > 0) {
								this.twentyObject = {};
								this.twentyObject.time = false,
								this.twentyObject.key = this.state.employeesSelected[em].key;
								this.twentyObject.label = this.appointmentstwenty[0].contact_name;
								this.twentyObject.value = this.appointmentstwenty[0]._id;
								this.twentyObject.appointment = [];
								this.twentyObject.appointment.push(this.appointmentstwenty[0]);
								this.twenty.push(this.twentyObject);
							} else {
								this.twentyObject = {};
								this.twentyObject.time = false,
								this.twentyObject.key = '';
								this.twentyObject.label = '';
								this.twentyObject.value = '';
								this.twentyObject.appointment = [];
								this.twenty.push(this.twentyObject);
							}
							this.appointmentstwentyone = _.filter(appointmentslist.docs, { hour: '21', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentstwentyone.length > 0) {
								this.twentyoneObject = {};
								this.twentyoneObject.time = false,
								this.twentyoneObject.key = this.state.employeesSelected[em].key;
								this.twentyoneObject.label = this.appointmentstwentyone[0].contact_name;
								this.twentyoneObject.value = this.appointmentstwentyone[0]._id;
								this.twentyoneObject.appointment = [];
								this.twentyoneObject.appointment.push(this.appointmentstwentyone[0]);
								this.twentyone.push(this.twentyoneObject);
							} else {
								this.twentyoneObject = {};
								this.twentyoneObject.time = false,
								this.twentyoneObject.key = '';
								this.twentyoneObject.label = '';
								this.twentyoneObject.value = '';
								this.twentyoneObject.appointment = [];
								this.twentyone.push(this.twentyoneObject);
							}
						}
						
					}
				}
				this.setState({ employeesListText: 'Employee(s) selected', showspinner: false, employeesSelectedCount: this.state.employeesSelected.length, employeesSelected: this.state.employeesSelected, contactsList: this.contactsList, employeesList: this.employeesList });
			} else {
				if (this.state.employeesSelected.length > 0) {
					for (let em = 0; em < this.state.employeesSelected.length; em += 1) {
						if (this.state.employeesSelected[em].key !== 'employee') {
							this.eightObject = {};
							this.eightObject.time = false,
							this.eightObject.key = '';
							this.eightObject.label = '';
							this.eightObject.value = '';
							this.eightObject.appointment = [];
							this.eight.push(this.eightObject);
							this.nineObject = {};
							this.nineObject.time = false,
							this.nineObject.key = '';
							this.nineObject.label = '';
							this.nineObject.value = '';
							this.nineObject.appointment = [];
							this.nine.push(this.nineObject);
							this.tenObject = {};
							this.tenObject.time = false,
							this.tenObject.key = '';
							this.tenObject.label = '';
							this.tenObject.value = '';
							this.tenObject.appointment = [];
							this.ten.push(this.tenObject);
							this.elevenObject = {};
							this.elevenObject.time = false,
							this.elevenObject.key = '';
							this.elevenObject.label = '';
							this.elevenObject.value = '';
							this.elevenObject.appointment = [];
							this.eleven.push(this.elevenObject);
							this.twelveObject = {};
							this.twelveObject.time = false,
							this.twelveObject.key = '';
							this.twelveObject.label = '';
							this.twelveObject.value = '';
							this.twelveObject.appointment = [];
							this.twelve.push(this.twelveObject);
							this.thirteenObject = {};
							this.thirteenObject.time = false,
							this.thirteenObject.key = '';
							this.thirteenObject.label = '';
							this.thirteenObject.value = '';
							this.thirteenObject.appointment = [];
							this.thirteen.push(this.thirteenObject);
							this.fourteenObject = {};
							this.fourteenObject.time = false,
							this.fourteenObject.key = '';
							this.fourteenObject.label = '';
							this.fourteenObject.value = '';
							this.fourteenObject.appointment = [];
							this.fourteen.push(this.fourteenObject);
							this.fiveteenObject = {};
							this.fiveteenObject.time = false,
							this.fiveteenObject.key = '';
							this.fiveteenObject.label = '';
							this.fiveteenObject.value = '';
							this.fiveteenObject.appointment = [];
							this.fiveteen.push(this.fiveteenObject);
							this.sixteenObject = {};
							this.sixteenObject.time = false,
							this.sixteenObject.key = '';
							this.sixteenObject.label = '';
							this.sixteenObject.value = '';
							this.sixteenObject.appointment = [];
							this.sixteen.push(this.sixteenObject);
							this.seventeenObject = {};
							this.seventeenObject.time = false,
							this.seventeenObject.key = '';
							this.seventeenObject.label = '';
							this.seventeenObject.value = '';
							this.seventeenObject.appointment = [];
							this.seventeen.push(this.seventeenObject);
							this.eighteenObject = {};
							this.eighteenObject.time = false,
							this.eighteenObject.key = '';
							this.eighteenObject.label = '';
							this.eighteenObject.value = '';
							this.eighteenObject.appointment = [];
							this.eighteen.push(this.eighteenObject);
							this.nineteenObject = {};
							this.nineteenObject.time = false,
							this.nineteenObject.key = '';
							this.nineteenObject.label = '';
							this.nineteenObject.value = '';
							this.nineteenObject.appointment = [];
							this.nineteen.push(this.nineteenObject);
							this.twentyObject = {};
							this.twentyObject.time = false,
							this.twentyObject.key = '';
							this.twentyObject.label = '';
							this.twentyObject.value = '';
							this.twentyObject.appointment = [];
							this.twenty.push(this.twentyObject);
							this.twentyoneObject = {};
							this.twentyoneObject.time = false,
							this.twentyoneObject.key = '';
							this.twentyoneObject.label = '';
							this.twentyoneObject.value = '';
							this.twentyoneObject.appointment = [];
							this.twentyone.push(this.twentyoneObject);
						}
					}
				}
				this.setState({ employeesListText: 'Employee(s) selected', showspinner: false, employeesSelectedCount: this.state.employeesSelected.length, employeesSelected: this.state.employeesSelected, contactsList: this.contactsList, employeesList: this.employeesList });
			}
		}
		this.setState({ showspinner: false });
	}

	async showScaleAnimationDialog(item) {
		this.treatmentslist = '';
		if (item.appointment.length === 0) {
			this.appointmentdetails = {
				_id: '',
				doctype: 'appointment',
				date: this.state.todaysDate,
				hour: '',
				minute: '',
				contact_id: '',
				contact_name: '',
				employee_id: '',
				employee_alias: '',
				notes: ''
			};
			this.setState({ appointment: this.appointmentdetails });
		} else if (item.appointment.length > 0) {
			this.treatmentslist = '';
			const queryTreatmentsAppointment = { selector: { doctype: 'treatment', appointment_id: item.appointment[0]._id }, };
			const treatmentInfo = await DBCompanyConnection.find(queryTreatmentsAppointment);
			for (let t = 0; t < treatmentInfo.docs.length; t += 1) {
				if (this.treatmentslist === '') {
					this.treatmentslist = `${treatmentInfo.docs[t].name}`;
				} else {
					this.treatmentslist = `${this.treatmentslist}, ${treatmentInfo.docs[t].name}`;
				}
			}
			this.treatmentslistinfo = treatmentInfo.docs;
			this.setState({ appointment: item.appointment[0] });
		}
		if (item.time === false) {
			this.scaleAnimationDialog.show();
		}
	}
	
	showEmployeesList() {
		Actions.AppointmentsEmployeesList({
			title: 'Employees list',
			appointmentsdate: this.state.todaysDate,
			area: 'dashboard',
		});
	}

	onChangeAppointmentsDate(newValue, prop) {
		this.setState({ todaysDate: newValue, showspinner: true });
		if (this.state.employeesSelected.length > 0) {
			this.scaleAnimationDialog.dismiss();
			this.showData(newValue);
		} else {
			this.scaleAnimationDialog.dismiss();
			this.setState({ todaysDate: newValue, showspinner: false });
		}
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

	async saveAppointment() {
		if (this.state.appointment._id === '') {
			const newappointment = {};
			newappointment.doctype = 'appointment';
			newappointment.date = this.state.appointment.date;
			newappointment.hour = this.state.appointment.hour;
			newappointment.minute = this.state.appointment.minute;
			newappointment.contact_id = this.state.appointment.contact_id;
			newappointment.employee_id = this.state.appointment.employee_id;
			newappointment.notes = this.state.appointment.notes;
			const savedappointment = await DBCompanyConnection.post(newappointment);
			const newid = savedappointment.id;
			const newrev = savedappointment.rev;
			this.onChangeText(newid, '_id');
			this.onChangeText(newrev, '_rev');
			this.saveAppointmentAlert('created', savedappointment.id);
		} else {
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
				{ text: 'OK', onPress: () => this.showData(this.state.todaysDate), style: 'cancel' }
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
		const queryTreatmentsAppointment = { selector: { doctype: 'treatment', appointment_id: this.state.appointment._id }, };
		const treatmentInfo = await DBCompanyConnection.find(queryTreatmentsAppointment);
		if (treatmentInfo.docs.length > 0) {
			for (let t = 0; t < treatmentInfo.docs.length; t += 1) {
				const treatmentDeleted = await DBCompanyConnection.remove(treatmentInfo.docs[t]);
			}
		}
		const queryAppointmentImages = { selector: { doctype: 'images', area: 'appointment', owner: this.state.appointment._id }, };
		const appointmentimages = await DBCompanyConnection.find(queryAppointmentImages);
		if (appointmentimages.docs.length > 0) {
			for (let i = 0; i < appointmentimages.docs.length; i += 1) {
				const imageDeleted = await DBCompanyConnection.remove(appointmentimages.docs[i]);
			}
		}
		this.deleteAppointmentAlert();
	}

	deleteAppointmentAlert() {
		this.showData(this.state.todaysDate);
		Alert.alert(
			'Appointment deleted',
			`The appointment for ${this.state.appointment.contact_name} on ${this.state.appointment.date} at ${this.state.appointment.hour}:${this.state.appointment.minute} has been deleted`,
			[
				{ text: 'OK', onPress: () => this.closePopupDialog(), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	closePopupDialog() {
		this.scaleAnimationDialog.dismiss();
	}

	renderDialogButtons() {
		if (this.state.appointment._id === '') {
			return (
				<ActionButton
					size={40}
					buttonColor="#9DBDF2"
					offsetX={15}
					offsetY={15}
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
		return (
			<ActionButton
				size={40}
				buttonColor="#9DBDF2"
				offsetX={15}
				offsetY={15}
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
				<ActionButton.Item buttonColor="steelblue" title="View details" onPress={() => { Actions.AppointmentsInfo({ appointmentid: this.state.appointment._id, title: 'Appointment', appointmentdate: this.state.todaysDate }); }}>
					<IconMaterial name="pageview" size={28} color="white" />
				</ActionButton.Item>
			</ActionButton>
		);
	}

	checkHour(hour) {
		switch(hour){
		case 'one':
			if (this.state.hours.one === true) {
				this.state.hours.one = false;
			} else {
				this.state.hours.one = true;
			}
			break;
		case 'two':
			if (this.state.hours.two === true) {
				this.state.hours.two = false;
			} else {
				this.state.hours.two = true;
			}
			break;
		case 'three':
			if (this.state.hours.three === true) {
				this.state.hours.three = false;
			} else {
				this.state.hours.three = true;
			}
			break;
		case 'four':
			if (this.state.hours.four === true) {
				this.state.hours.four = false;
			} else {
				this.state.hours.four = true;
			}
			break;
		case 'five':
			if (this.state.hours.five === true) {
				this.state.hours.five = false;
			} else {
				this.state.hours.five = true;
			}
			break;
		case 'six':
			if (this.state.hours.six === true) {
				this.state.hours.six = false;
			} else {
				this.state.hours.six = true;
			}
			break;
		case 'seven':
			if (this.state.hours.seven === true) {
				this.state.hours.seven = false;
			} else {
				this.state.hours.seven = true;
			}
			break;
		case 'eight':
			if (this.state.hours.eight === true) {
				this.state.hours.eight = false;
			} else {
				this.state.hours.eight = true;
			}
			break;
		case 'nine':
			if (this.state.hours.nine === true) {
				this.state.hours.nine = false;
			} else {
				this.state.hours.nine = true;
			}
			break;
		case 'ten':
			if (this.state.hours.ten === true) {
				this.state.hours.ten = false;
			} else {
				this.state.hours.ten = true;
			}
			break;
		case 'eleven':
			if (this.state.hours.eleven === true) {
				this.state.hours.eleven = false;
			} else {
				this.state.hours.eleven = true;
			}
			break;
		case 'twelve':
			if (this.state.hours.twelve === true) {
				this.state.hours.twelve = false;
			} else {
				this.state.hours.twelve = true;
			}
			break;
		case 'thirteen':
			if (this.state.hours.thirteen === true) {
				this.state.hours.thirteen = false;
			} else {
				this.state.hours.thirteen = true;
			}
			break;
		case 'fourteen':
			if (this.state.hours.fourteen === true) {
				this.state.hours.fourteen = false;
			} else {
				this.state.hours.fourteen = true;
			}
			break;
		case 'fiveteen':
			if (this.state.hours.fiveteen === true) {
				this.state.hours.fiveteen = false;
			} else {
				this.state.hours.fiveteen = true;
			}
			break;
		case 'sixteen':
			if (this.state.hours.sixteen === true) {
				this.state.hours.sixteen = false;
			} else {
				this.state.hours.sixteen = true;
			}
			break;
		case 'seventeen':
			if (this.state.hours.seventeen === true) {
				this.state.hours.seventeen = false;
			} else {
				this.state.hours.seventeen = true;
			}
			break;
		case 'eighteen':
			if (this.state.hours.eighteen === true) {
				this.state.hours.eighteen = false;
			} else {
				this.state.hours.eighteen = true;
			}
			break;
		case 'nineteen':
			if (this.state.hours.nineteen === true) {
				this.state.hours.nineteen = false;
			} else {
				this.state.hours.nineteen = true;
			}
			break;
		case 'twenty':
			if (this.state.hours.twenty === true) {
				this.state.hours.twenty = false;
			} else {
				this.state.hours.twenty = true;
			}
			break;
		case 'twentyone':
			if (this.state.hours.twentyone === true) {
				this.state.hours.twentyone = false;
			} else {
				this.state.hours.twentyone = true;
			}
			break;
		case 'twentytwo':
			if (this.state.hours.twentytwo === true) {
				this.state.hours.twentytwo = false;
			} else {
				this.state.hours.twentytwo = true;
			}
			break;
		case 'twentythree':
			if (this.state.hours.twentythree === true) {
				this.state.hours.twentythree = false;
			} else {
				this.state.hours.twentythree = true;
			}
			break;
		case 'twentyfour':
			if (this.state.hours.twentyfour === true) {
				this.state.hours.twentyfour = false;
			} else {
				this.state.hours.twentyfour = true;
			}
			break;
		}
		this.setState({ hours: this.state.hours });
	}

	checkDay(day) {
		switch(day){
		case 'monday':
			if (this.state.days.monday === true) {
				this.state.days.monday = false;
			} else {
				this.state.days.monday = true;
			}
			break;
		case 'tuesday':
			if (this.state.days.tuesday === true) {
				this.state.days.tuesday = false;
			} else {
				this.state.days.tuesday = true;
			}
			break;
		case 'wednesday':
			if (this.state.days.wednesday === true) {
				this.state.days.wednesday = false;
			} else {
				this.state.days.wednesday = true;
			}
			break;
		case 'thursday':
			if (this.state.days.thursday === true) {
				this.state.days.thursday = false;
			} else {
				this.state.days.thursday = true;
			}
			break;
		case 'friday':
			if (this.state.days.friday === true) {
				this.state.days.friday = false;
			} else {
				this.state.days.friday = true;
			}
			break;
		case 'saturday':
			if (this.state.days.saturday === true) {
				this.state.days.saturday = false;
			} else {
				this.state.days.saturday = true;
			}
			break;
		case 'sunday':
			if (this.state.days.sunday === true) {
				this.state.days.sunday = false;
			} else {
				this.state.days.sunday = true;
			}
			break;
		}
		this.setState({ days: this.state.days });
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Tabs initialPage={this.currentTab} ref={(c) => { this._tabs = c; }}>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Daily</Text></TabHeading>}>
						<View style={{ borderColor: 'steelblue', borderBottomWidth: 2, height: 54 }}>
							<View
								style={{
									paddingTop: 5,
									paddingLeft: 10,
									paddingBottom: 6,
									flexDirection: 'row', flex: 1
								}}
							>
								<DatePicker
									date={this.state.todaysDate}
									mode="date"
									placeholder="Date"
									format="DD-MM-YYYY"
									confirmBtnText="Ok"
									cancelBtnText="Cancel"
									customStyles={{
										dateIcon: {
											alignItems: 'center',
											alignSelf: 'center',
										},
										dateInput: {
											height: 40,
											borderColor: '#C0C0C0',
											borderWidth: 1,
											borderRadius: 6,
										}
									}}
									onDateChange={(date) => {
										this.onChangeAppointmentsDate(date, 'date');
									}}
								/>
								<TouchableOpacity onPress={this.showEmployeesList.bind(this)} style={{ height: 40 }}>
									<View style={{ flexDirection: 'row', flex: 1, padding: 10, borderColor: '#C0C0C0', borderWidth: 1, borderRadius: 6 }}>
										<Text>{this.state.employeesListText}</Text>
										<MaterialCommunityIcons name="arrow-down-drop-circle-outline" size={20} style={{ color: '#CCCCCC' }} />
									</View>
								</TouchableOpacity>
							</View>
						</View>
						<KeyboardAwareScrollView>
						<Content>
							<PopupDialog
								width={fullWidth - 30}
								height={fullHeight - 180}
								ref={(popupDialog) => {
									this.scaleAnimationDialog = popupDialog;
								}}
								dialogTitle={<DialogTitle title="Appointment" />}
								dialogStyle={{
									marginBottom: 50
								}}
							>
								<View
									style={{
										paddingHorizontal: 20,
										justifyContent: 'center',
										alignSelf: 'center',
										alignItems: 'center'
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
									<View
										style={{
											flexDirection: 'row',
											height: 60,
										}}
									>
										<IconMaterial
											name="access-time"
											size={20}
											style={{
												marginTop: 25,
											}}
										/>
										<Text
											style={{
												marginTop: 25,
												marginLeft: 20,
												fontWeight: 'bold',
											}}
										>
											Hour
										</Text>
										<ModalPicker style={{ marginLeft: 20 }} data={this.hoursList} label="" initValue={this.state.appointment.hour} onChange={(option)=>{ this.onChangeText(option, 'hour'); }} />
										<Text
											style={{
												marginTop: 25,
												marginLeft: 20,
												fontWeight: 'bold',
											}}
										>
											Minute
										</Text>
										<ModalPicker style={{ marginLeft: 20 }} data={this.minutesList} label="" initValue={this.state.appointment.minute} onChange={(option)=>{ this.onChangeText(option, 'minute'); }} />
									
									</View>
									<View
										style={{
											flexDirection: 'row',
											height: 60,
										}}
									>
										<IconMaterial
											name="perm-identity"
											size={20}
											style={{
												marginTop: 25,
											}}
										/>
										<Text
											style={{
												marginTop: 25,
												marginLeft: 20,
												fontWeight: 'bold',
											}}
										>Contact</Text>
										<ModalPicker style={{ marginLeft: 20 }} data={this.contactsList} label="" initValue={this.state.appointment.contact_name} onChange={(option)=>{ this.onChangeText(option, 'contact_id'); }} />
									</View>
									<View
										style={{
											flexDirection: 'row',
											height: 60,
										}}
									>
										<IconMaterial
											name="supervisor-account"
											size={20}
											style={{
												marginTop: 25,
											}}
										/>
										<Text
											style={{
												marginTop: 25,
												marginLeft: 20,
												fontWeight: 'bold',
											}}
										>Employee</Text>
										<ModalPicker style={{ marginLeft: 20 }} data={this.employeesList} label="" initValue={this.state.appointment.employee_alias} onChange={(option)=>{ this.onChangeText(option, 'employee_id'); }} />
									</View>
									<View
										style={{
											flexDirection: 'row',
											height: 20,
											marginTop: 5,
											alignSelf: 'flex-start'
										}}
									>
										<Text note style={{ marginRight: 30 }}>Select treatment(s)</Text> 
										{this.state.appointment._id !== '' &&
											<ActionButton size={24} icon={<MaterialCommunityIcons name="plus" size={16} color="white" />} buttonColor="#8fbc8f" offsetX={0} offsetY={0} onPress={() => { Actions.AppointmentsTreatmentsList({ title: 'Treatments list', treatmentslistinfo: this.treatmentslistinfo, appointment: this.state.appointment }); }} />
										}
									</View>
									<Text note style={{ marginTop: 5, alignSelf: 'flex-start', paddingTop: 2.5, fontStyle: 'italic', backgroundColor: 'transparent' }}>{this.treatmentslist}</Text>
									<Text style={{ alignSelf: 'flex-start', fontWeight: 'bold', paddingVertical: 10 }}>General notes</Text>
									
									<View
										style={{
											flexDirection: 'row',
											height: 70,
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
												borderColor: '#C0C0C0',
												borderWidth: 1,
												borderRadius: 6,
												color: '#424B4F',
												width: fullWidth - 80,
											}}
											onChangeText={(text) => {
												this.onChangeText(text, 'notes');
											}}
											value={this.state.appointment.notes}
										/>
									</View>

									
								</View>
								{this.renderDialogButtons()}
							</PopupDialog>
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
							{this.state.employeesSelectedCount > 0 && this.state.showspinner === false &&
							<Grid style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
								<Row>
									<FlatList
										data={this.state.employeesSelected}
										renderItem={({item}) => (
											<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: 'steelblue' }}>
												<Text note style={{ fontSize: 9, textAlign: 'center', color: 'white', fontWeight: 'bold' }} >
													{item.label}
												</Text>
											</View>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.eight}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.nine}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.ten}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.eleven}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.twelve}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.thirteen}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.fourteen}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.fiveteen}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.sixteen}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.seventeen}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.eighteen}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.nineteen}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.twenty}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
								<Row>
									<FlatList
										data={this.twentyone}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeesSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeesSelectedCount} />
								</Row>
							</Grid>	
							}
							<View style={{ height: 60 }} />
						</Content>
						</KeyboardAwareScrollView>
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Weekly</Text></TabHeading>}>
						{/* <View style={{ borderColor: 'steelblue', borderBottomWidth: 2, height: 54 }}>
							<View
								style={{
									paddingTop: 6,
									paddingLeft: 10,
									paddingBottom: 6,
									flexDirection: 'row', flex: 1
								}}
							>
								<DatePicker
									date={this.state.weekDate}
									mode="date"
									placeholder="20-11-17 / 26-11-17"
									// format="DD-MM-YYYY"
									confirmBtnText="Ok"
									cancelBtnText="Cancel"
									customStyles={{
										dateIcon: {
											alignItems: 'center',
											alignSelf: 'center',
										},
										dateInput: {
											height: 40,
											borderColor: '#C0C0C0',
											borderWidth: 1,
											borderRadius: 6,
										}
									}}
									onDateChange={(date) => {
										this.onChangeAppointmentDate(date, 'date');
									}}
								/>
								<TouchableOpacity onPress={this.showEmployeesList.bind(this)} style={{ height: 40 }}>
									<View style={{ flexDirection: 'row', flex: 1, padding: 10, borderColor: '#C0C0C0', borderWidth: 1, borderRadius: 6 }}>
										<Text>David DEA</Text>
										<MaterialCommunityIcons name="arrow-down-drop-circle-outline" size={20} style={{ color: '#CCCCCC' }} />
									</View>
								</TouchableOpacity>
							</View>
						</View> */}
						{/* <Content>
							<View style={{ padding: 2.5 }}>
								<Grid style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
									<Col style={{ borderColor: '#d7d7d6', borderWidth: 0.5, backgroundColor: 'steelblue' }}>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 40 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												David DEA
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												8:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												9:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												10:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												11:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												12:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												13:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												14:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												15:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												16:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												17:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												18:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												19:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												20:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												21:00
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }} >
												22:00
											</Text>
										</Row>
									</Col>
									<Col style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 40 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'black' }} >
												Mon
												20/11/17
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
									</Col>
									<Col style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 40 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'black' }} >
												Tues
												21/11/17
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
									</Col>
									<Col style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 40 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'black' }} >
												Wednes
												22/11/17
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												Juan Jota
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												Pepe Palo
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
									</Col>
									<Col style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 40 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'black' }} >
												Thurs
												23/11/17
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												Steve Stevenson 18:45
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												John Johnason
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												Dan Daniels
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
									</Col>
									<Col style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 40 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'black' }} >
												Fri
												24/11/17
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												Aaron Aronson
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
									</Col>
									<Col style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 40 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'black' }} >
												Satur
												25/11/17
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
									</Col>
									<Col style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 40 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', color: 'black' }} >
												Sun
												26/11/17
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
										<Row style={{ borderColor: '#d7d7d6', borderWidth: 0.5, height: 65 }}>
											<Text note style={{ fontSize: 10, alignSelf: 'center', alignItems: 'center', }} >
												
											</Text>
										</Row>
									</Col>
								</Grid>
							</View>
							<View style={{ height: 60 }} />
						</Content> */}
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Configuration</Text></TabHeading>}>
						<View style={{ borderColor: 'steelblue', borderBottomWidth: 2, borderTopWidth: 2, height: 40 }}>
							<Text style={{ fontWeight: 'bold', alignSelf: 'center', alignItems: 'center', paddingTop: 8 }}>Hours visible (Daily and weekly)</Text>
						</View>
						<Content style={{ borderColor: 'steelblue', borderBottomWidth: 0.25, borderWidth: 0.5 }}>
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }} >
								<CheckBox
									title='01:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.one}
									onPress={() => { this.checkHour('one'); }}
								/>
								<CheckBox
									title='02:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.two}
									onPress={() => { this.checkHour('two'); }}
								/>
								<CheckBox
									title='03:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.three}
									onPress={() => { this.checkHour('three'); }}
								/>
								<CheckBox
									title='04:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.four}
									onPress={() => { this.checkHour('four'); }}
								/>
							</View>
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }} >
								<CheckBox
									title='05:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.five}
									onPress={() => { this.checkHour('five'); }}
								/>
								<CheckBox
									title='06:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.six}
									onPress={() => { this.checkHour('six'); }}
								/>
								<CheckBox
									title='07:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.seven}
									onPress={() => { this.checkHour('seven'); }}
								/>
								<CheckBox
									title='08:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.eight}
									onPress={() => { this.checkHour('eight'); }}
								/>
							</View>
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }} >
								<CheckBox
									title='09:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.nine}
									onPress={() => { this.checkHour('nine'); }}
								/>
								<CheckBox
									title='10:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.ten}
									onPress={() => { this.checkHour('ten'); }}
								/>
								<CheckBox
									title='11:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.eleven}
									onPress={() => { this.checkHour('eleven'); }}
								/>
								<CheckBox
									title='12:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.twelve}
									onPress={() => { this.checkHour('twelve'); }}
								/>
							</View>
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }} >
								<CheckBox
									title='13:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.thirteen}
									onPress={() => { this.checkHour('thirteen'); }}
								/>
								<CheckBox
									title='14:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.fourteen}
									onPress={() => { this.checkHour('fourteen'); }}
								/>
								<CheckBox
									title='15:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.fiveteen}
									onPress={() => { this.checkHour('fiveteen'); }}
								/>
								<CheckBox
									title='16:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.sixteen}
									onPress={() => { this.checkHour('sixteen'); }}
								/>
							</View>
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }} >
								<CheckBox
									title='17:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.seventeen}
									onPress={() => { this.checkHour('seventeen'); }}
								/>
								<CheckBox
									title='18:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.eighteen}
									onPress={() => { this.checkHour('eighteen'); }}
								/>
								<CheckBox
									title='19:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.nineteen}
									onPress={() => { this.checkHour('nineteen'); }}
								/>
								<CheckBox
									title='20:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.twenty}
									onPress={() => { this.checkHour('twenty'); }}
								/>
							</View>
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }} >
								<CheckBox
									title='21:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.twentyone}
									onPress={() => { this.checkHour('twentyone'); }}
								/>
								<CheckBox
									title='22:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.twentytwo}
									onPress={() => { this.checkHour('twentytwo'); }}
								/>
								<CheckBox
									title='23:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.twentythree}
									onPress={() => { this.checkHour('twentythree'); }}
								/>
								<CheckBox
									title='24:00'
									containerStyle={{
										flex: 0.2,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.hours.twentyfour}
									onPress={() => { this.checkHour('twentyfour'); }}
								/>
							</View>
						<View style={{ borderColor: 'steelblue', borderBottomWidth: 2, borderTopWidth: 2, height: 40 }}>
							<Text style={{ fontWeight: 'bold', alignSelf: 'center', alignItems: 'center', paddingTop: 8 }}>Days visible (Weekly)</Text>
						</View>
						<View >
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 10 }} >
								<CheckBox
									title='Monday'
									containerStyle={{
										flex: 0.3,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent',
										marginRight: 17
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.days.monday}
									onPress={() => { this.checkDay('monday'); }}
								/>
								<CheckBox
									title='Tuesday'
									containerStyle={{
										flex: 0.3,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.days.tuesday}
									onPress={() => { this.checkDay('tuesday'); }}
								/>
								<CheckBox
									title='Wednesday'
									containerStyle={{
										flex: 0.4,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.days.wednesday}
									onPress={() => { this.checkDay('wednesday'); }}
								/>
							</View>
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }} >
								<CheckBox
									title='Thursday'
									containerStyle={{
										flex: 0.3,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.days.thursday}
									onPress={() => { this.checkDay('thursday'); }}
								/>
								<CheckBox
									title='Friday'
									containerStyle={{
										flex: 0.7,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.days.friday}
									onPress={() => { this.checkDay('friday'); }}
								/>
							</View>
							<View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }} >
								<CheckBox
									title='Saturday'
									containerStyle={{
										flex: 0.3,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.days.saturday}
									onPress={() => { this.checkDay('saturday'); }}
								/>
								<CheckBox
									title='Sunday'
									containerStyle={{
										flex: 0.7,
										padding: 2,
										backgroundColor: 'transparent',
										borderColor: 'transparent'
									}}
									iconType='material'
									checkedIcon='check-box'
									uncheckedIcon='check-box-outline-blank'
									checkedColor='steelblue'
									checked={this.state.days.sunday}
									onPress={() => { this.checkDay('sunday'); }}
								/>
							</View>
						</View>
					</Content>
					</Tab>
				</Tabs>
				<ModalSide />
				<FooterMain activeArea="Dashboard" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(Dashboard);
