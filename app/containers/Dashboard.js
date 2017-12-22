import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Dimensions, AsyncStorage, ListView, View, TextInput, Keyboard, TouchableOpacity, Alert, FlatList, Image } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab, Tabs, Tab, TabHeading, Badge, Left, Right, Label, Input, Spinner  } from 'native-base';
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
import Calendar from 'react-native-calendar';

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;

class Dashboard extends Component {

	constructor(props) {
		super(props);
		this.mainTabs = null;
		this.state = {
			showspinner: true,
			showspinnertext: 'Loading appointments, please wait',
			tab: this.props.tab || '',
			mondayOfWeek: this.props.mondayOfWeek || '',
			weekdatefrom: this.props.weekdatefrom || '',
			weekdateto: this.props.weekdateto || '',
			todaysDate: this.props.appointmentsdate || '',
			showWeekCalendar: false,
			weekSelectedDate: this.props.weekSelectedDate || [],
			selectedDate: moment().format('YYYY-MM-DD'),
			weekDate: this.props.weekDate || 'Select week',
			dialogShow: false,
			employeesSelected: this.props.employeesSelected || [],
			employeesSelectedCount: '0',
			employeeWeekSelected: this.props.employeeWeekSelected || '',
			employeeWeekSelectedCount: 0,
			employeeWeekText: this.props.employeeWeekText || 'Select staff',
			appointment: this.props.appointment || {},
			mainappointment: {},
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
			employeesListText: 'Select staff',
			schedule: {
				_id: '',
				doctype: 'schedule',
				userid: this.userLoggedId,
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
				twentyfour: false,
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
		this.headerWeeklyView = [];
		this.one = [];
		this.two = [];
		this.three = [];
		this.four = [];
		this.five = [];
		this.six = [];
		this.seven = [];
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
		this.twentytwo = [];
		this.twentythree = [];
		this.twentyfour = [];
		this.oneWeek = [];
		this.twoWeek = [];
		this.threeWeek = [];
		this.fourWeek = [];
		this.fiveWeek = [];
		this.sixWeek = [];
		this.sevenWeek = [];
		this.eightWeek = [];
		this.nineWeek = [];
		this.tenWeek = [];
		this.elevenWeek = [];
		this.twelveWeek = [];
		this.thirteenWeek = [];
		this.fourteenWeek = [];
		this.fiveteenWeek = [];
		this.sixteenWeek = [];
		this.seventeenWeek = [];
		this.eighteenWeek = [];
		this.nineteenWeek = [];
		this.twentyWeek = [];
		this.twentyoneWeek = [];
		this.twentytwoWeek = [];
		this.twentythreeWeek = [];
		this.twentyfourWeek = [];
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
						if (this.state.tab === 'daily') {
							this._tabs.goToPage(0);
						} else if (this.state.tab === 'weekly') {
							this._tabs.goToPage(1);
						}
						this.connectCompanyDb(true);
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
		this.appointment_treatment = _.filter(treatmentInfo.docs, { treatment_id: this.state.appointment.treatment_id });
		if (_.isEmpty(this.appointment_treatment)) {
			this.closePopupDialog();
		}
		this.treatmentslistinfo = treatmentInfo.docs;
		this.setState({ appointment: this.state.appointment });
		this.connectCompanyDb(true);
	}

	async showData(dateValue) {
		this.one = [];
		this.two = [];
		this.three = [];
		this.four = [];
		this.five = [];
		this.six = [];
		this.seven = [];
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
		this.twentytwo = [];
		this.twentythree = [];
		this.twentyfour = [];
		this.oneWeek = [];
		this.twoWeek = [];
		this.threeWeek = [];
		this.fourWeek = [];
		this.fiveWeek = [];
		this.sixWeek = [];
		this.sevenWeek = [];
		this.eightWeek = [];
		this.nineWeek = [];
		this.tenWeek = [];
		this.elevenWeek = [];
		this.twelveWeek = [];
		this.thirteenWeek = [];
		this.fourteenWeek = [];
		this.fiveteenWeek = [];
		this.sixteenWeek = [];
		this.seventeenWeek = [];
		this.eighteenWeek = [];
		this.nineteenWeek = [];
		this.twentyWeek = [];
		this.twentyoneWeek = [];
		this.twentytwoWeek = [];
		this.twentythreeWeek = [];
		this.twentyfourWeek = [];
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
		this.querySchedule = {
			'selector': {
				'doctype': 'schedule',
				'userid': this.userLoggedId,
			},
			'fields': []
		};
		this.schedule = '';
		const scheduleinfo = await DBCompanyConnection.find(this.querySchedule);
		if (scheduleinfo.docs.length > 0) {
			this.schedule = scheduleinfo.docs[0];
			this.state.employeeWeekSelectedCount = 1;
			if (this.schedule.monday === true) {
				this.state.employeeWeekSelectedCount++;
			} 
			if (this.schedule.tuesday === true) {
				this.state.employeeWeekSelectedCount++;
			} 
			if (this.schedule.wednesday === true) {
				this.state.employeeWeekSelectedCount++;
			} 
			if (this.schedule.thursday === true) {
				this.state.employeeWeekSelectedCount++;
			}
			 if (this.schedule.friday === true) {
				this.state.employeeWeekSelectedCount++;
			} 
			if (this.schedule.saturday === true) {
				this.state.employeeWeekSelectedCount++;
			} 
			if (this.schedule.sunday === true) {
				this.state.employeeWeekSelectedCount++;
			}
		} else {
			this.state.employeeWeekSelectedCount = 6;
			const schedule = {
				doctype: 'schedule',
				userid: this.userLoggedId,
				one: this.state.schedule.one,
				two: this.state.schedule.two,
				three: this.state.schedule.three,
				four: this.state.schedule.four,
				five: this.state.schedule.five,
				six: this.state.schedule.six,
				seven: this.state.schedule.seven,
				eight: this.state.schedule.eight,
				nine: true,
				ten: true,
				eleven: true,
				twelve: true,
				thirteen: true,
				fourteen: true,
				fiveteen: true,
				sixteen: true,
				seventeen: true,
				eighteen: this.state.schedule.eighteen,
				nineteen: this.state.schedule.nineteen,
				twenty: this.state.schedule.twenty,
				twentyone: this.state.schedule.twentyone,
				twentytwo: this.state.schedule.twentytwo,
				twentythree: this.state.schedule.twentythree,
				twentyfour: this.state.schedule.twentyfour,
				monday: true,
				tuesday: true,
				wednesday: true,
				thursday: true,
				friday: true,
				saturday: this.state.schedule.saturday,
				sunday: this.state.schedule.sunday
			};
			const newSchedule = await DBCompanyConnection.post(schedule);
			newrev = newSchedule.rev;
			const inschedule = schedule;
			inschedule['_rev'] = newSchedule.rev;
			inschedule['_id'] = newSchedule.id;
			this.schedule = inschedule;
		}
		if (this.state.employeesSelected.length > 0) {
			this.queryAppointments = {
				'selector': {
					'date': this.state.todaysDate,
					'$or': [
						{ 'doctype': { '$eq': 'appointment' }},
						{ 'doctype': { '$eq': 'appointmentamended' }},
					]
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
			this.oneObject = {
				time: true,
				key: '01:00',
				label: '01:00',
				value: '01:00',
				appointment: []
			};
			this.one.push(this.oneObject);
			this.twoObject = {
				time: true,
				key: '02:00',
				label: '02:00',
				value: '02:00',
				appointment: []
			};
			this.two.push(this.twoObject);
			this.threeObject = {
				time: true,
				key: '03:00',
				label: '03:00',
				value: '03:00',
				appointment: []
			};
			this.three.push(this.threeObject);
			this.fourObject = {
				time: true,
				key: '04:00',
				label: '04:00',
				value: '04:00',
				appointment: []
			};
			this.four.push(this.fourObject);
			this.fiveObject = {
				time: true,
				key: '05:00',
				label: '05:00',
				value: '05:00',
				appointment: []
			};
			this.five.push(this.fiveObject);
			this.sixObject = {
				time: true,
				key: '06:00',
				label: '06:00',
				value: '06:00',
				appointment: []
			};
			this.six.push(this.sixObject);			
			this.sevenObject = {
				time: true,
				key: '07:00',
				label: '07:00',
				value: '07:00',
				appointment: []
			};
			this.seven.push(this.sevenObject);
			this.eightObject = {
				time: true,
				key: '08:00',
				label: '08:00',
				value: '08:00',
				appointment: []
			};
			this.eight.push(this.eightObject);
			this.nineObject = {
				time: true,
				key: '09:00',
				label: '09:00',
				value: '09:00',
				appointment: []
			};
			this.nine.push(this.nineObject);
			this.tenObject = {
				time: true,
				key: '10:00',
				label: '10:00',
				value: '10:00',
				appointment: []
			};
			this.ten.push(this.tenObject);
			this.elevenObject = {
				time: true,
				key: '11:00',
				label: '11:00',
				value: '11:00',
				appointment: []
			};
			this.eleven.push(this.elevenObject);
			this.twelveObject = {
				time: true,
				key: '12:00',
				label: '12:00',
				value: '12:00',
				appointment: []
			};
			this.twelve.push(this.twelveObject);
			this.thirteenObject = {
				time: true,
				key: '13:00',
				label: '13:00',
				value: '13:00',
				appointment: []
			};
			this.thirteen.push(this.thirteenObject);
			this.fourteenObject = {
				time: true,
				key: '14:00',
				label: '14:00',
				value: '14:00',
				appointment: []
			};
			this.fourteen.push(this.fourteenObject);
			this.fiveteenObject = {
				time: true,
				key: '15:00',
				label: '15:00',
				value: '15:00',
				appointment: []
			};
			this.fiveteen.push(this.fiveteenObject);
			this.sixteenObject = {
				time: true,
				key: '16:00',
				label: '16:00',
				value: '16:00',
				appointment: []
			};
			this.sixteen.push(this.sixteenObject);
			this.seventeenObject = {
				time: true,
				key: '17:00',
				label: '17:00',
				value: '17:00',
				appointment: []
			};
			this.seventeen.push(this.seventeenObject);
			this.eighteenObject = {
				time: true,
				key: '18:00',
				label: '18:00',
				value: '18:00',
				appointment: []
			};
			this.eighteen.push(this.eighteenObject);
			this.nineteenObject = {
				time: true,
				key: '19:00',
				label: '19:00',
				value: '19:00',
				appointment: []
			};
			this.nineteen.push(this.nineteenObject);
			this.twentyObject = {
				time: true,
				key: '20:00',
				label: '20:00',
				value: '20:00',
				appointment: []
			};
			this.twenty.push(this.twentyObject);
			this.twentyoneObject = {
				time: true,
				key: '21:00',
				label: '21:00',
				value: '21:00',
				appointment: []
			};
			this.twentyone.push(this.twentyoneObject);
			this.twentytwoObject = {
				time: true,
				key: '22:00',
				label: '22:00',
				value: '22:00',
				appointment: []
			};
			this.twentytwo.push(this.twentytwoObject);
			this.twentythreeObject = {
				time: true,
				key: '23:00',
				label: '23:00',
				value: '23:00',
				appointment: []
			};
			this.twentythree.push(this.twentythreeObject);
			this.twentyfourObject = {
				time: true,
				key: '24:00',
				label: '24:00',
				value: '24:00',
				appointment: []
			};
			this.twentyfour.push(this.twentyfourObject);
			this.emptyObject = {
				time: false,
				key: '',
				label: '',
				value: '',
				appointment: [],
			};
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
							this.appointmentsone = _.filter(appointmentslist.docs, { hour: '01', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsone.length > 0) {
								this.oneObject = {};
								this.oneObject.time = false,
								this.oneObject.key = this.state.employeesSelected[em].key;
								this.oneObject.label = this.appointmentsone[0].contact_name;
								this.oneObject.value = this.appointmentsone[0]._id;
								this.oneObject.appointment = [];
								this.oneObject.appointment.push(this.appointmentsone[0]);
								this.one.push(this.oneObject);
							} else {
								this.one.push(this.emptyObject);
							}
							this.appointmentstwo = _.filter(appointmentslist.docs, { hour: '02', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentstwo.length > 0) {
								this.twoObject = {};
								this.twoObject.time = false,
								this.twoObject.key = this.state.employeesSelected[em].key;
								this.twoObject.label = this.appointmentstwo[0].contact_name;
								this.twoObject.value = this.appointmentstwo[0]._id;
								this.twoObject.appointment = [];
								this.twoObject.appointment.push(this.appointmentstwo[0]);
								this.two.push(this.twoObject);
							} else {
								this.two.push(this.emptyObject);
							}
							this.appointmentsthree = _.filter(appointmentslist.docs, { hour: '03', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsthree.length > 0) {
								this.threeObject = {};
								this.threeObject.time = false,
								this.threeObject.key = this.state.employeesSelected[em].key;
								this.threeObject.label = this.appointmentsthree[0].contact_name;
								this.threeObject.value = this.appointmentsthree[0]._id;
								this.threeObject.appointment = [];
								this.threeObject.appointment.push(this.appointmentsthree[0]);
								this.three.push(this.threeObject);
							} else {
								this.three.push(this.emptyObject);
							}
							this.appointmentsfour = _.filter(appointmentslist.docs, { hour: '04', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsfour.length > 0) {
								this.fourObject = {};
								this.fourObject.time = false,
								this.fourObject.key = this.state.employeesSelected[em].key;
								this.fourObject.label = this.appointmentsfour[0].contact_name;
								this.fourObject.value = this.appointmentsfour[0]._id;
								this.fourObject.appointment = [];
								this.fourObject.appointment.push(this.appointmentsfour[0]);
								this.four.push(this.fourObject);
							} else {
								this.four.push(this.emptyObject);
							}
							this.appointmentsfive = _.filter(appointmentslist.docs, { hour: '05', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsfive.length > 0) {
								this.fiveObject = {};
								this.fiveObject.time = false,
								this.fiveObject.key = this.state.employeesSelected[em].key;
								this.fiveObject.label = this.appointmentsfive[0].contact_name;
								this.fiveObject.value = this.appointmentsfive[0]._id;
								this.fiveObject.appointment = [];
								this.fiveObject.appointment.push(this.appointmentsfive[0]);
								this.five.push(this.fiveObject);
							} else {
								this.five.push(this.emptyObject);
							}
							this.appointmentssix = _.filter(appointmentslist.docs, { hour: '06', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentssix.length > 0) {
								this.sixObject = {};
								this.sixObject.time = false,
								this.sixObject.key = this.state.employeesSelected[em].key;
								this.sixObject.label = this.appointmentssix[0].contact_name;
								this.sixObject.value = this.appointmentssix[0]._id;
								this.sixObject.appointment = [];
								this.sixObject.appointment.push(this.appointmentssix[0]);
								this.six.push(this.sixObject);
							} else {
								this.six.push(this.emptyObject);
							}
							this.appointmentsseven = _.filter(appointmentslist.docs, { hour: '07', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentsseven.length > 0) {
								this.sevenObject = {};
								this.sevenObject.time = false,
								this.sevenObject.key = this.state.employeesSelected[em].key;
								this.sevenObject.label = this.appointmentsseven[0].contact_name;
								this.sevenObject.value = this.appointmentsseven[0]._id;
								this.sevenObject.appointment = [];
								this.sevenObject.appointment.push(this.appointmentsseven[0]);
								this.seven.push(this.sevenObject);
							} else {
								this.seven.push(this.emptyObject);
							}
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
								this.eight.push(this.emptyObject);
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
								this.nine.push(this.emptyObject);
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
								this.ten.push(this.emptyObject);
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
								this.eleven.push(this.emptyObject);
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
								this.twelve.push(this.emptyObject);
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
								this.thirteen.push(this.emptyObject);
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
								this.fourteen.push(this.emptyObject);
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
								this.fiveteen.push(this.emptyObject);
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
								this.sixteen.push(this.emptyObject);
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
								this.seventeen.push(this.emptyObject);
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
								this.eighteen.push(this.emptyObject);
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
								this.nineteen.push(this.emptyObject);
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
								this.twenty.push(this.emptyObject);
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
								this.twentyone.push(this.emptyObject);
							}
							this.appointmentstwentytwo = _.filter(appointmentslist.docs, { hour: '22', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentstwentytwo.length > 0) {
								this.twentytwoObject = {};
								this.twentytwoObject.time = false,
								this.twentytwoObject.key = this.state.employeesSelected[em].key;
								this.twentytwoObject.label = this.appointmentstwentytwo[0].contact_name;
								this.twentytwoObject.value = this.appointmentstwentytwo[0]._id;
								this.twentytwoObject.appointment = [];
								this.twentytwoObject.appointment.push(this.appointmentstwentytwo[0]);
								this.twentytwo.push(this.twentytwoObject);
							} else {
								this.twentytwo.push(this.emptyObject);
							}
							this.appointmentstwentythree = _.filter(appointmentslist.docs, { hour: '23', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentstwentythree.length > 0) {
								this.twentythreeObject = {};
								this.twentythreeObject.time = false,
								this.twentythreeObject.key = this.state.employeesSelected[em].key;
								this.twentythreeObject.label = this.appointmentstwentythree[0].contact_name;
								this.twentythreeObject.value = this.appointmentstwentythree[0]._id;
								this.twentythreeObject.appointment = [];
								this.twentythreeObject.appointment.push(this.appointmentstwentythree[0]);
								this.twentythree.push(this.twentythreeObject);
							} else {
								this.twentythree.push(this.emptyObject);
							}
							this.appointmentstwentyfour = _.filter(appointmentslist.docs, { hour: '24', employee_id: this.state.employeesSelected[em].value });
							if (this.appointmentstwentyfour.length > 0) {
								this.twentyfourObject = {};
								this.twentyfourObject.time = false,
								this.twentyfourObject.key = this.state.employeesSelected[em].key;
								this.twentyfourObject.label = this.appointmentstwentyfour[0].contact_name;
								this.twentyfourObject.value = this.appointmentstwentyfour[0]._id;
								this.twentyfourObject.appointment = [];
								this.twentyfourObject.appointment.push(this.appointmentstwentyfour[0]);
								this.twentyfour.push(this.twentyfourObject);
							} else {
								this.twentyfour.push(this.emptyObject);
							}
						}
						
					}
				}
				this.setState({ schedule: this.schedule, employeesListText: 'Staff selected', showspinner: false, employeesSelectedCount: this.state.employeesSelected.length, employeesSelected: this.state.employeesSelected, contactsList: this.contactsList, employeesList: this.employeesList });
			} else {
				if (this.state.employeesSelected.length > 0) {
					for (let em = 0; em < this.state.employeesSelected.length; em += 1) {
						if (this.state.employeesSelected[em].key !== 'employee') {
							this.one.push(this.emptyObject);
							this.two.push(this.emptyObject);
							this.three.push(this.emptyObject);
							this.four.push(this.emptyObject);
							this.five.push(this.emptyObject);
							this.six.push(this.emptyObject);
							this.seven.push(this.emptyObject);
							this.eight.push(this.emptyObject);
							this.nine.push(this.emptyObject);
							this.ten.push(this.emptyObject);
							this.eleven.push(this.emptyObject);
							this.twelve.push(this.emptyObject);
							this.thirteen.push(this.emptyObject);
							this.fourteen.push(this.emptyObject);
							this.fiveteen.push(this.emptyObject);
							this.sixteen.push(this.emptyObject);
							this.seventeen.push(this.emptyObject);
							this.eighteen.push(this.emptyObject);
							this.nineteen.push(this.emptyObject);
							this.twenty.push(this.emptyObject);
							this.twentyone.push(this.emptyObject);
							this.twentytwo.push(this.emptyObject);
							this.twentythree.push(this.emptyObject);
							this.twentyfour.push(this.emptyObject);
						}
					}
				}
				this.setState({ schedule: this.schedule, employeesListText: 'Staff selected', showspinner: false, employeesSelectedCount: this.state.employeesSelected.length, employeesSelected: this.state.employeesSelected, contactsList: this.contactsList, employeesList: this.employeesList });
			}
		}
		if (!_.isEmpty(this.state.weekdatefrom)) {
			if (!_.isEmpty(this.state.employeeWeekSelected)) {
				this.headerWeeklyView = [];
				const employeeSelectedHeaderWeeklyView = {
					day: false,
					key: 'employeeWeeklyView',
					value: this.state.employeeWeekSelected.value,
					label: '(Time)'
				};
				this.headerWeeklyView.push(employeeSelectedHeaderWeeklyView);
				const mondayDD = this.state.weekdatefrom.substring(0, 2);;
				const labelMonday = 'Mon'+' '+mondayDD;
				const mondayHeaderWeeklyView = {
					day: true,
					key: 'monday',
					value: this.state.weekdatefrom,
					label: labelMonday
				};
				if (this.schedule.monday === true) {
					this.headerWeeklyView.push(mondayHeaderWeeklyView);
				}
				const tuesday = moment(this.state.mondayOfWeek).add(1, 'days').format('DD-MM-YYYY');
				const tuesdayDD = tuesday.substring(0, 2);;
				const labelTuesday = 'Tue'+' '+tuesdayDD;
				const tuesdayHeaderWeeklyView = {
					day: true,
					key: 'tuesday',
					value: tuesday,
					label: labelTuesday
				};
				if (this.schedule.tuesday === true) {
					this.headerWeeklyView.push(tuesdayHeaderWeeklyView);
				}
				const wednesday = moment(this.state.mondayOfWeek).add(2, 'days').format('DD-MM-YYYY');
				const wednesdayDD = wednesday.substring(0, 2);;
				const labelWednesday = 'Wed'+' '+wednesdayDD;
				const wednesdayHeaderWeeklyView = {
					day: true,
					key: 'wednesday',
					value: wednesday,
					label: labelWednesday
				};
				if (this.schedule.wednesday === true) {
					this.headerWeeklyView.push(wednesdayHeaderWeeklyView);
				}
				const thursday = moment(this.state.mondayOfWeek).add(3, 'days').format('DD-MM-YYYY');
				const thursdayDD = thursday.substring(0, 2);;
				const labelThursday = 'Thu'+' '+thursdayDD;
				const thursdayHeaderWeeklyView = {
					day: true,
					key: 'thursday',
					value: thursday,
					label: labelThursday
				};
				if (this.schedule.thursday === true) {
					this.headerWeeklyView.push(thursdayHeaderWeeklyView);
				}
				const friday = moment(this.state.mondayOfWeek).add(4, 'days').format('DD-MM-YYYY');
				const fridayDD = friday.substring(0, 2);;
				const labelFriday = 'Fri'+' '+fridayDD;
				const fridayHeaderWeeklyView = {
					day: true,
					key: 'friday',
					value: friday,
					label: labelFriday
				};
				if (this.schedule.friday === true) {
					this.headerWeeklyView.push(fridayHeaderWeeklyView);
				}
				const saturday = moment(this.state.mondayOfWeek).add(5, 'days').format('DD-MM-YYYY');
				const saturdayDD = saturday.substring(0, 2);;
				const labelSaturday = 'Sat'+' '+saturdayDD;
				const saturdayHeaderWeeklyView = {
					day: true,
					key: 'saturday',
					value: saturday,
					label: labelSaturday
				};
				if (this.schedule.saturday === true) {
					this.headerWeeklyView.push(saturdayHeaderWeeklyView);
				}
				const sunday = moment(this.state.mondayOfWeek).add(6, 'days').format('DD-MM-YYYY');
				const sundayDD = sunday.substring(0, 2);;
				const labelSunday = 'Sun'+' '+sundayDD;
				const sundayHeaderWeeklyView = {
					day: true,
					key: 'sunday',
					value: sunday,
					label: labelSunday
				};
				if (this.schedule.sunday === true) {
					this.headerWeeklyView.push(sundayHeaderWeeklyView);
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
				this.oneObject = {
					time: true,
					key: '01:00',
					label: '01:00',
					value: '01:00',
					appointment: []
				};
				this.oneWeek.push(this.oneObject);
				this.twoObject = {
					time: true,
					key: '02:00',
					label: '02:00',
					value: '02:00',
					appointment: []
				};
				this.twoWeek.push(this.twoObject);
				this.threeObject = {
					time: true,
					key: '03:00',
					label: '03:00',
					value: '03:00',
					appointment: []
				};
				this.threeWeek.push(this.threeObject);
				this.fourObject = {
					time: true,
					key: '04:00',
					label: '04:00',
					value: '04:00',
					appointment: []
				};
				this.fourWeek.push(this.fourObject);
				this.fiveObject = {
					time: true,
					key: '05:00',
					label: '05:00',
					value: '05:00',
					appointment: []
				};
				this.fiveWeek.push(this.fiveObject);
				this.sixObject = {
					time: true,
					key: '06:00',
					label: '06:00',
					value: '06:00',
					appointment: []
				};
				this.sixWeek.push(this.sixObject);			
				this.sevenObject = {
					time: true,
					key: '07:00',
					label: '07:00',
					value: '07:00',
					appointment: []
				};
				this.sevenWeek.push(this.sevenObject);
				this.eightObject = {
					time: true,
					key: '08:00',
					label: '08:00',
					value: '08:00',
					appointment: []
				};
				this.eightWeek.push(this.eightObject);
				this.nineObject = {
					time: true,
					key: '09:00',
					label: '09:00',
					value: '09:00',
					appointment: []
				};
				this.nineWeek.push(this.nineObject);
				this.tenObject = {
					time: true,
					key: '10:00',
					label: '10:00',
					value: '10:00',
					appointment: []
				};
				this.tenWeek.push(this.tenObject);
				this.elevenObject = {
					time: true,
					key: '11:00',
					label: '11:00',
					value: '11:00',
					appointment: []
				};
				this.elevenWeek.push(this.elevenObject);
				this.twelveObject = {
					time: true,
					key: '12:00',
					label: '12:00',
					value: '12:00',
					appointment: []
				};
				this.twelveWeek.push(this.twelveObject);
				this.thirteenObject = {
					time: true,
					key: '13:00',
					label: '13:00',
					value: '13:00',
					appointment: []
				};
				this.thirteenWeek.push(this.thirteenObject);
				this.fourteenObject = {
					time: true,
					key: '14:00',
					label: '14:00',
					value: '14:00',
					appointment: []
				};
				this.fourteenWeek.push(this.fourteenObject);
				this.fiveteenObject = {
					time: true,
					key: '15:00',
					label: '15:00',
					value: '15:00',
					appointment: []
				};
				this.fiveteenWeek.push(this.fiveteenObject);
				this.sixteenObject = {
					time: true,
					key: '16:00',
					label: '16:00',
					value: '16:00',
					appointment: []
				};
				this.sixteenWeek.push(this.sixteenObject);
				this.seventeenObject = {
					time: true,
					key: '17:00',
					label: '17:00',
					value: '17:00',
					appointment: []
				};
				this.seventeenWeek.push(this.seventeenObject);
				this.eighteenObject = {
					time: true,
					key: '18:00',
					label: '18:00',
					value: '18:00',
					appointment: []
				};
				this.eighteenWeek.push(this.eighteenObject);
				this.nineteenObject = {
					time: true,
					key: '19:00',
					label: '19:00',
					value: '19:00',
					appointment: []
				};
				this.nineteenWeek.push(this.nineteenObject);
				this.twentyObject = {
					time: true,
					key: '20:00',
					label: '20:00',
					value: '20:00',
					appointment: []
				};
				this.twentyWeek.push(this.twentyObject);
				this.twentyoneObject = {
					time: true,
					key: '21:00',
					label: '21:00',
					value: '21:00',
					appointment: []
				};
				this.twentyoneWeek.push(this.twentyoneObject);
				this.twentytwoObject = {
					time: true,
					key: '22:00',
					label: '22:00',
					value: '22:00',
					appointment: []
				};
				this.twentytwoWeek.push(this.twentytwoObject);
				this.twentythreeObject = {
					time: true,
					key: '23:00',
					label: '23:00',
					value: '23:00',
					appointment: []
				};
				this.twentythreeWeek.push(this.twentythreeObject);
				this.twentyfourObject = {
					time: true,
					key: '24:00',
					label: '24:00',
					value: '24:00',
					appointment: []
				};
				this.twentyfourWeek.push(this.twentyfourObject);
				this.emptyObject = {
					time: false,
					key: '',
					label: '',
					value: '',
					appointment: [],
				};
				this.queryAppointmentsWeek = {
					'selector': {
						date: {
							$gte: this.state.weekdatefrom,
							$lte: this.state.weekdateto,
						},
						'$or': [
							{ 'doctype': { '$eq': 'appointment' }},
							{ 'doctype': { '$eq': 'appointmentamended' }},
						]
					},
					'fields': []
				};
				this.appointmentslistweek = await DBCompanyConnection.find(this.queryAppointmentsWeek);
				if (this.appointmentslistweek.docs.length > 0) {
					for (let a = 0; a < this.appointmentslistweek.docs.length; a += 1) {
						this.queryContacts = {
							'selector': {
								'doctype': 'contact',
								'_id': this.appointmentslistweek.docs[a].contact_id,
							},
							'fields': []
						};
						const contactinfo = await DBCompanyConnection.find(this.queryContacts);
						if (contactinfo.docs.length > 0) {
							this.appointmentslistweek.docs[a].contact_name = contactinfo.docs[0].givenName + ' ' + contactinfo.docs[0].familyName;
						}
						const queryEmployee = { selector: { doctype: 'user', _id: this.appointmentslistweek.docs[a].employee_id }, };
						const employeeInfo = await DBCompanyConnection.find(queryEmployee);
						if (employeeInfo.docs.length > 0) {
							if (_.isEmpty(this.appointmentslistweek.docs[a].employee_alias)) {
								this.appointmentslistweek.docs[a].employee_alias = employeeInfo.docs[0].alias;
								if (this.appointmentslistweek.docs[a].alias === '') {
									this.appointmentslistweek.docs[a].employee_alias = employeeInfo.docs[0].name;
									if (this.appointmentslistweek.docs[a].name === '') {
										this.appointmentslistweek.docs[a].employee_alias = employeeInfo.docs[0].email;
									}
								}
							}
						}
					}
					if (!_.isEmpty(this.state.employeeWeekSelected)) {
						for (let d = 0; d < this.headerWeeklyView.length; d += 1) {
							if (this.headerWeeklyView[d].day !== false) {
								this.appointmentsone = _.filter(this.appointmentslistweek.docs, { hour: '01', date: this.headerWeeklyView[d].value });
								if (this.appointmentsone.length > 0) {
									this.oneObject = {};
									this.oneObject.time = false,
									this.oneObject.key = this.state.employeeWeekSelected.key;
									this.oneObject.label = this.appointmentsone[0].contact_name;
									this.oneObject.value = this.appointmentsone[0]._id;
									this.oneObject.appointment = [];
									this.oneObject.appointment.push(this.appointmentsone[0]);
									this.oneWeek.push(this.oneObject);
								} else {
									this.oneWeek.push(this.emptyObject);
								}
								this.appointmentstwo = _.filter(this.appointmentslistweek.docs, { hour: '02', date: this.headerWeeklyView[d].value });
								if (this.appointmentstwo.length > 0) {
									this.twoObject = {};
									this.twoObject.time = false,
									this.twoObject.key = this.state.employeeWeekSelected.key;
									this.twoObject.label = this.appointmentstwo[0].contact_name;
									this.twoObject.value = this.appointmentstwo[0]._id;
									this.twoObject.appointment = [];
									this.twoObject.appointment.push(this.appointmentstwo[0]);
									this.twoWeek.push(this.twoObject);
								} else {
									this.twoWeek.push(this.emptyObject);
								}
								this.appointmentsthree = _.filter(this.appointmentslistweek.docs, { hour: '03', date: this.headerWeeklyView[d].value });
								if (this.appointmentsthree.length > 0) {
									this.threeObject = {};
									this.threeObject.time = false,
									this.threeObject.key = this.state.employeeWeekSelected.key;
									this.threeObject.label = this.appointmentsthree[0].contact_name;
									this.threeObject.value = this.appointmentsthree[0]._id;
									this.threeObject.appointment = [];
									this.threeObject.appointment.push(this.appointmentsthree[0]);
									this.threeWeek.push(this.threeObject);
								} else {
									this.threeWeek.push(this.emptyObject);
								}
								this.appointmentsfour = _.filter(this.appointmentslistweek.docs, { hour: '04', date: this.headerWeeklyView[d].value });
								if (this.appointmentsfour.length > 0) {
									this.fourObject = {};
									this.fourObject.time = false,
									this.fourObject.key = this.state.employeeWeekSelected.key;
									this.fourObject.label = this.appointmentsfour[0].contact_name;
									this.fourObject.value = this.appointmentsfour[0]._id;
									this.fourObject.appointment = [];
									this.fourObject.appointment.push(this.appointmentsfour[0]);
									this.fourWeek.push(this.fourObject);
								} else {
									this.fourWeek.push(this.emptyObject);
								}
								this.appointmentsfive = _.filter(this.appointmentslistweek.docs, { hour: '05', date: this.headerWeeklyView[d].value });
								if (this.appointmentsfive.length > 0) {
									this.fiveObject = {};
									this.fiveObject.time = false,
									this.fiveObject.key = this.state.employeeWeekSelected.key;
									this.fiveObject.label = this.appointmentsfive[0].contact_name;
									this.fiveObject.value = this.appointmentsfive[0]._id;
									this.fiveObject.appointment = [];
									this.fiveObject.appointment.push(this.appointmentsfive[0]);
									this.fiveWeek.push(this.fiveObject);
								} else {
									this.fiveWeek.push(this.emptyObject);
								}
								this.appointmentssix = _.filter(this.appointmentslistweek.docs, { hour: '06', date: this.headerWeeklyView[d].value });
								if (this.appointmentssix.length > 0) {
									this.sixObject = {};
									this.sixObject.time = false,
									this.sixObject.key = this.state.employeeWeekSelected.key;
									this.sixObject.label = this.appointmentssix[0].contact_name;
									this.sixObject.value = this.appointmentssix[0]._id;
									this.sixObject.appointment = [];
									this.sixObject.appointment.push(this.appointmentssix[0]);
									this.sixWeek.push(this.sixObject);
								} else {
									this.sixWeek.push(this.emptyObject);
								}
								this.appointmentsseven = _.filter(this.appointmentslistweek.docs, { hour: '07', date: this.headerWeeklyView[d].value });
								if (this.appointmentsseven.length > 0) {
									this.sevenObject = {};
									this.sevenObject.time = false,
									this.sevenObject.key = this.state.employeeWeekSelected.key;
									this.sevenObject.label = this.appointmentsseven[0].contact_name;
									this.sevenObject.value = this.appointmentsseven[0]._id;
									this.sevenObject.appointment = [];
									this.sevenObject.appointment.push(this.appointmentsseven[0]);
									this.sevenWeek.push(this.sevenObject);
								} else {
									this.sevenWeek.push(this.emptyObject);
								}
								this.appointmentseight = _.filter(this.appointmentslistweek.docs, { hour: '08', date: this.headerWeeklyView[d].value });
								if (this.appointmentseight.length > 0) {
									this.eightObject = {};
									this.eightObject.time = false,
									this.eightObject.key = this.state.employeeWeekSelected.key;
									this.eightObject.label = this.appointmentseight[0].contact_name;
									this.eightObject.value = this.appointmentseight[0]._id;
									this.eightObject.appointment = [];
									this.eightObject.appointment.push(this.appointmentseight[0]);
									this.eightWeek.push(this.eightObject);
								} else {
									this.eightWeek.push(this.emptyObject);
								}
								this.appointmentsnine = _.filter(this.appointmentslistweek.docs, { hour: '09', date: this.headerWeeklyView[d].value });
								if (this.appointmentsnine.length > 0) {
									this.nineObject = {};
									this.nineObject.time = false,
									this.nineObject.key = this.state.employeeWeekSelected.key;
									this.nineObject.label = this.appointmentsnine[0].contact_name;
									this.nineObject.value = this.appointmentsnine[0]._id;
									this.nineObject.appointment = [];
									this.nineObject.appointment.push(this.appointmentsnine[0]);
									this.nineWeek.push(this.nineObject);
								} else {
									this.nineWeek.push(this.emptyObject);
								}
								this.appointmentsten = _.filter(this.appointmentslistweek.docs, { hour: '10', date: this.headerWeeklyView[d].value });
								if (this.appointmentsten.length > 0) {
									this.tenObject = {};
									this.tenObject.time = false,
									this.tenObject.key = this.state.employeeWeekSelected.key;
									this.tenObject.label = this.appointmentsten[0].contact_name;
									this.tenObject.value = this.appointmentsten[0]._id;
									this.tenObject.appointment = [];
									this.tenObject.appointment.push(this.appointmentsten[0]);
									this.tenWeek.push(this.tenObject);
								} else {
									this.tenWeek.push(this.emptyObject);
								}
								this.appointmentseleven = _.filter(this.appointmentslistweek.docs, { hour: '11', date: this.headerWeeklyView[d].value });
								if (this.appointmentseleven.length > 0) {
									this.elevenObject = {};
									this.elevenObject.time = false,
									this.elevenObject.key = this.state.employeeWeekSelected.key;
									this.elevenObject.label = this.appointmentseleven[0].contact_name;
									this.elevenObject.value = this.appointmentseleven[0]._id;
									this.elevenObject.appointment = [];
									this.elevenObject.appointment.push(this.appointmentseleven[0]);
									this.elevenWeek.push(this.elevenObject);
								} else {
									this.elevenWeek.push(this.emptyObject);
								}
								this.appointmentstwelve = _.filter(this.appointmentslistweek.docs, { hour: '12', date: this.headerWeeklyView[d].value });
								if (this.appointmentstwelve.length > 0) {
									this.twelveObject = {};
									this.twelveObject.time = false,
									this.twelveObject.key = this.state.employeeWeekSelected.key;
									this.twelveObject.label = this.appointmentstwelve[0].contact_name;
									this.twelveObject.value = this.appointmentstwelve[0]._id;
									this.twelveObject.appointment = [];
									this.twelveObject.appointment.push(this.appointmentstwelve[0]);
									this.twelveWeek.push(this.twelveObject);
								} else {
									this.twelveWeek.push(this.emptyObject);
								}
								this.appointmentsthirteen = _.filter(this.appointmentslistweek.docs, { hour: '13', date: this.headerWeeklyView[d].value });
								if (this.appointmentsthirteen.length > 0) {
									this.thirteenObject = {};
									this.thirteenObject.time = false,
									this.thirteenObject.key = this.state.employeeWeekSelected.key;
									this.thirteenObject.label = this.appointmentsthirteen[0].contact_name;
									this.thirteenObject.value = this.appointmentsthirteen[0]._id;
									this.thirteenObject.appointment = [];
									this.thirteenObject.appointment.push(this.appointmentsthirteen[0]);
									this.thirteenWeek.push(this.thirteenObject);
								} else {
									this.thirteenWeek.push(this.emptyObject);
								}
								this.appointmentsfourteen = _.filter(this.appointmentslistweek.docs, { hour: '14', date: this.headerWeeklyView[d].value });
								if (this.appointmentsfourteen.length > 0) {
									this.fourteenObject = {};
									this.fourteenObject.time = false,
									this.fourteenObject.key = this.state.employeeWeekSelected.key;
									this.fourteenObject.label = this.appointmentsfourteen[0].contact_name;
									this.fourteenObject.value = this.appointmentsfourteen[0]._id;
									this.fourteenObject.appointment = [];
									this.fourteenObject.appointment.push(this.appointmentsfourteen[0]);
									this.fourteenWeek.push(this.fourteenObject);
								} else {
									this.fourteenWeek.push(this.emptyObject);
								}
								this.appointmentsfiveteen = _.filter(this.appointmentslistweek.docs, { hour: '15', date: this.headerWeeklyView[d].value });
								if (this.appointmentsfiveteen.length > 0) {
									this.fiveteenObject = {};
									this.fiveteenObject.time = false,
									this.fiveteenObject.key = this.state.employeeWeekSelected.key;
									this.fiveteenObject.label = this.appointmentsfiveteen[0].contact_name;
									this.fiveteenObject.value = this.appointmentsfiveteen[0]._id;
									this.fiveteenObject.appointment = [];
									this.fiveteenObject.appointment.push(this.appointmentsfiveteen[0]);
									this.fiveteenWeek.push(this.fiveteenObject);
								} else {
									this.fiveteenWeek.push(this.emptyObject);
								}
								this.appointmentssixteen = _.filter(this.appointmentslistweek.docs, { hour: '16', date: this.headerWeeklyView[d].value });
								if (this.appointmentssixteen.length > 0) {
									this.sixteenObject = {};
									this.sixteenObject.time = false,
									this.sixteenObject.key = this.state.employeeWeekSelected.key;
									this.sixteenObject.label = this.appointmentssixteen[0].contact_name;
									this.sixteenObject.value = this.appointmentssixteen[0]._id;
									this.sixteenObject.appointment = [];
									this.sixteenObject.appointment.push(this.appointmentssixteen[0]);
									this.sixteenWeek.push(this.sixteenObject);
								} else {
									this.sixteenWeek.push(this.emptyObject);
								}
								this.appointmentsseventeen = _.filter(this.appointmentslistweek.docs, { hour: '17', date: this.headerWeeklyView[d].value });
								if (this.appointmentsseventeen.length > 0) {
									this.seventeenObject = {};
									this.seventeenObject.time = false,
									this.seventeenObject.key = this.state.employeeWeekSelected.key;
									this.seventeenObject.label = this.appointmentsseventeen[0].contact_name;
									this.seventeenObject.value = this.appointmentsseventeen[0]._id;
									this.seventeenObject.appointment = [];
									this.seventeenObject.appointment.push(this.appointmentsseventeen[0]);
									this.seventeenWeek.push(this.seventeenObject);
								} else {
									this.seventeenWeek.push(this.emptyObject);
								}
								this.appointmentseighteen = _.filter(this.appointmentslistweek.docs, { hour: '18', date: this.headerWeeklyView[d].value });
								if (this.appointmentseighteen.length > 0) {
									this.eighteenObject = {};
									this.eighteenObject.time = false,
									this.eighteenObject.key = this.state.employeeWeekSelected.key;
									this.eighteenObject.label = this.appointmentseighteen[0].contact_name;
									this.eighteenObject.value = this.appointmentseighteen[0]._id;
									this.eighteenObject.appointment = [];
									this.eighteenObject.appointment.push(this.appointmentseighteen[0]);
									this.eighteenWeek.push(this.eighteenObject);
								} else {
									this.eighteenWeek.push(this.emptyObject);
								}
								this.appointmentsnineteen = _.filter(this.appointmentslistweek.docs, { hour: '19', date: this.headerWeeklyView[d].value });
								if (this.appointmentsnineteen.length > 0) {
									this.nineteenObject = {};
									this.nineteenObject.time = false,
									this.nineteenObject.key = this.state.employeeWeekSelected.key;
									this.nineteenObject.label = this.appointmentsnineteen[0].contact_name;
									this.nineteenObject.value = this.appointmentsnineteen[0]._id;
									this.nineteenObject.appointment = [];
									this.nineteenObject.appointment.push(this.appointmentsnineteen[0]);
									this.nineteenWeek.push(this.nineteenObject);
								} else {
									this.nineteenWeek.push(this.emptyObject);
								}
								this.appointmentstwenty = _.filter(this.appointmentslistweek.docs, { hour: '20', date: this.headerWeeklyView[d].value });
								if (this.appointmentstwenty.length > 0) {
									this.twentyObject = {};
									this.twentyObject.time = false,
									this.twentyObject.key = this.state.employeeWeekSelected.key;
									this.twentyObject.label = this.appointmentstwenty[0].contact_name;
									this.twentyObject.value = this.appointmentstwenty[0]._id;
									this.twentyObject.appointment = [];
									this.twentyObject.appointment.push(this.appointmentstwenty[0]);
									this.twentyWeek.push(this.twentyObject);
								} else {
									this.twentyWeek.push(this.emptyObject);
								}
								this.appointmentstwentyone = _.filter(this.appointmentslistweek.docs, { hour: '21', date: this.headerWeeklyView[d].value });
								if (this.appointmentstwentyone.length > 0) {
									this.twentyoneObject = {};
									this.twentyoneObject.time = false,
									this.twentyoneObject.key = this.state.employeeWeekSelected.key;
									this.twentyoneObject.label = this.appointmentstwentyone[0].contact_name;
									this.twentyoneObject.value = this.appointmentstwentyone[0]._id;
									this.twentyoneObject.appointment = [];
									this.twentyoneObject.appointment.push(this.appointmentstwentyone[0]);
									this.twentyoneWeek.push(this.twentyoneObject);
								} else {
									this.twentyoneWeek.push(this.emptyObject);
								}
								this.appointmentstwentytwo = _.filter(this.appointmentslistweek.docs, { hour: '22', date: this.headerWeeklyView[d].value });
								if (this.appointmentstwentytwo.length > 0) {
									this.twentytwoObject = {};
									this.twentytwoObject.time = false,
									this.twentytwoObject.key = this.state.employeeWeekSelected.key;
									this.twentytwoObject.label = this.appointmentstwentytwo[0].contact_name;
									this.twentytwoObject.value = this.appointmentstwentytwo[0]._id;
									this.twentytwoObject.appointment = [];
									this.twentytwoObject.appointment.push(this.appointmentstwentytwo[0]);
									this.twentytwoWeek.push(this.twentytwoObject);
								} else {
									this.twentytwoWeek.push(this.emptyObject);
								}
								this.appointmentstwentythree = _.filter(this.appointmentslistweek.docs, { hour: '23', date: this.headerWeeklyView[d].value });
								if (this.appointmentstwentythree.length > 0) {
									this.twentythreeObject = {};
									this.twentythreeObject.time = false,
									this.twentythreeObject.key = this.state.employeeWeekSelected.key;
									this.twentythreeObject.label = this.appointmentstwentythree[0].contact_name;
									this.twentythreeObject.value = this.appointmentstwentythree[0]._id;
									this.twentythreeObject.appointment = [];
									this.twentythreeObject.appointment.push(this.appointmentstwentythree[0]);
									this.twentythreeWeek.push(this.twentythreeObject);
								} else {
									this.twentythreeWeek.push(this.emptyObject);
								}
								this.appointmentstwentyfour = _.filter(this.appointmentslistweek.docs, { hour: '24', date: this.headerWeeklyView[d].value });
								if (this.appointmentstwentyfour.length > 0) {
									this.twentyfourObject = {};
									this.twentyfourObject.time = false,
									this.twentyfourObject.key = this.state.employeeWeekSelected.key;
									this.twentyfourObject.label = this.appointmentstwentyfour[0].contact_name;
									this.twentyfourObject.value = this.appointmentstwentyfour[0]._id;
									this.twentyfourObject.appointment = [];
									this.twentyfourObject.appointment.push(this.appointmentstwentyfour[0]);
									this.twentyfourWeek.push(this.twentyfourObject);
								} else {
									this.twentyfourWeek.push(this.emptyObject);
								}
							}
						}
					}
					this.setState({ schedule: this.schedule, employeeWeekText: this.state.employeeWeekSelected.label, showspinner: false, employeeWeekSelectedCount: this.state.employeeWeekSelectedCount, employeeWeekSelected: this.state.employeeWeekSelected, contactsList: this.contactsList, employeesList: this.employeesList });
				} else {
					this.oneWeek = [];
					this.twoWeek = [];
					this.threeWeek = [];
					this.fourWeek = [];
					this.fiveWeek = [];
					this.sixWeek = [];
					this.sevenWeek = [];
					this.eightWeek = [];
					this.nineWeek = [];
					this.tenWeek = [];
					this.elevenWeek = [];
					this.twelveWeek = [];
					this.thirteenWeek = [];
					this.fourteenWeek = [];
					this.fiveteenWeek = [];
					this.sixteenWeek = [];
					this.seventeenWeek = [];
					this.eighteenWeek = [];
					this.nineteenWeek = [];
					this.twentyWeek = [];
					this.twentyoneWeek = [];
					this.twentytwoWeek = [];
					this.twentythreeWeek = [];
					this.twentyfourWeek = [];
					this.oneObject = {
						time: true,
						key: '01:00',
						label: '01:00',
						value: '01:00',
						appointment: []
					};
					this.oneWeek.push(this.oneObject);
					this.twoObject = {
						time: true,
						key: '02:00',
						label: '02:00',
						value: '02:00',
						appointment: []
					};
					this.twoWeek.push(this.twoObject);
					this.threeObject = {
						time: true,
						key: '03:00',
						label: '03:00',
						value: '03:00',
						appointment: []
					};
					this.threeWeek.push(this.threeObject);
					this.fourObject = {
						time: true,
						key: '04:00',
						label: '04:00',
						value: '04:00',
						appointment: []
					};
					this.fourWeek.push(this.fourObject);
					this.fiveObject = {
						time: true,
						key: '05:00',
						label: '05:00',
						value: '05:00',
						appointment: []
					};
					this.fiveWeek.push(this.fiveObject);
					this.sixObject = {
						time: true,
						key: '06:00',
						label: '06:00',
						value: '06:00',
						appointment: []
					};
					this.sixWeek.push(this.sixObject);			
					this.sevenObject = {
						time: true,
						key: '07:00',
						label: '07:00',
						value: '07:00',
						appointment: []
					};
					this.sevenWeek.push(this.sevenObject);
					this.eightObject = {
						time: true,
						key: '08:00',
						label: '08:00',
						value: '08:00',
						appointment: []
					};
					this.eightWeek.push(this.eightObject);
					this.nineObject = {
						time: true,
						key: '09:00',
						label: '09:00',
						value: '09:00',
						appointment: []
					};
					this.nineWeek.push(this.nineObject);
					this.tenObject = {
						time: true,
						key: '10:00',
						label: '10:00',
						value: '10:00',
						appointment: []
					};
					this.tenWeek.push(this.tenObject);
					this.elevenObject = {
						time: true,
						key: '11:00',
						label: '11:00',
						value: '11:00',
						appointment: []
					};
					this.elevenWeek.push(this.elevenObject);
					this.twelveObject = {
						time: true,
						key: '12:00',
						label: '12:00',
						value: '12:00',
						appointment: []
					};
					this.twelveWeek.push(this.twelveObject);
					this.thirteenObject = {
						time: true,
						key: '13:00',
						label: '13:00',
						value: '13:00',
						appointment: []
					};
					this.thirteenWeek.push(this.thirteenObject);
					this.fourteenObject = {
						time: true,
						key: '14:00',
						label: '14:00',
						value: '14:00',
						appointment: []
					};
					this.fourteenWeek.push(this.fourteenObject);
					this.fiveteenObject = {
						time: true,
						key: '15:00',
						label: '15:00',
						value: '15:00',
						appointment: []
					};
					this.fiveteenWeek.push(this.fiveteenObject);
					this.sixteenObject = {
						time: true,
						key: '16:00',
						label: '16:00',
						value: '16:00',
						appointment: []
					};
					this.sixteenWeek.push(this.sixteenObject);
					this.seventeenObject = {
						time: true,
						key: '17:00',
						label: '17:00',
						value: '17:00',
						appointment: []
					};
					this.seventeenWeek.push(this.seventeenObject);
					this.eighteenObject = {
						time: true,
						key: '18:00',
						label: '18:00',
						value: '18:00',
						appointment: []
					};
					this.eighteenWeek.push(this.eighteenObject);
					this.nineteenObject = {
						time: true,
						key: '19:00',
						label: '19:00',
						value: '19:00',
						appointment: []
					};
					this.nineteenWeek.push(this.nineteenObject);
					this.twentyObject = {
						time: true,
						key: '20:00',
						label: '20:00',
						value: '20:00',
						appointment: []
					};
					this.twentyWeek.push(this.twentyObject);
					this.twentyoneObject = {
						time: true,
						key: '21:00',
						label: '21:00',
						value: '21:00',
						appointment: []
					};
					this.twentyoneWeek.push(this.twentyoneObject);
					this.twentytwoObject = {
						time: true,
						key: '22:00',
						label: '22:00',
						value: '22:00',
						appointment: []
					};
					this.twentytwoWeek.push(this.twentytwoObject);
					this.twentythreeObject = {
						time: true,
						key: '23:00',
						label: '23:00',
						value: '23:00',
						appointment: []
					};
					this.twentythreeWeek.push(this.twentythreeObject);
					this.twentyfourObject = {
						time: true,
						key: '24:00',
						label: '24:00',
						value: '24:00',
						appointment: []
					};
					this.twentyfourWeek.push(this.twentyfourObject);
					this.emptyObject = {
						time: false,
						key: '',
						label: '',
						value: '',
						appointment: [],
					};
					if (!_.isEmpty(this.state.employeeWeekSelected)) {
						for (let d = 0; d < this.headerWeeklyView.length; d += 1) {
							if (this.headerWeeklyView[d].day !== false) {
								this.oneWeek.push(this.emptyObject);
								this.twoWeek.push(this.emptyObject);
								this.threeWeek.push(this.emptyObject);
								this.fourWeek.push(this.emptyObject);
								this.fiveWeek.push(this.emptyObject);
								this.sixWeek.push(this.emptyObject);
								this.sevenWeek.push(this.emptyObject);
								this.eightWeek.push(this.emptyObject);
								this.nineWeek.push(this.emptyObject);
								this.tenWeek.push(this.emptyObject);
								this.elevenWeek.push(this.emptyObject);
								this.twelveWeek.push(this.emptyObject);
								this.thirteenWeek.push(this.emptyObject);
								this.fourteenWeek.push(this.emptyObject);
								this.fiveteenWeek.push(this.emptyObject);
								this.sixteenWeek.push(this.emptyObject);
								this.seventeenWeek.push(this.emptyObject);
								this.eighteenWeek.push(this.emptyObject);
								this.nineteenWeek.push(this.emptyObject);
								this.twentyWeek.push(this.emptyObject);
								this.twentyoneWeek.push(this.emptyObject);
								this.twentytwoWeek.push(this.emptyObject);
								this.twentythreeWeek.push(this.emptyObject);
								this.twentyfourWeek.push(this.emptyObject);
							}
						}
					}
					this.setState({ schedule: this.schedule, employeeWeekText: this.state.employeeWeekSelected.label, showspinner: false, employeeWeekSelectedCount: this.state.employeeWeekSelectedCount, employeeWeekSelected: this.state.employeeWeekSelected, contactsList: this.contactsList, employeesList: this.employeesList });
				}
			}
		}
		this.setState({ showspinner: false, schedule: this.schedule });
	}

	async saveSchedule() {
		const savedSchedule = await DBCompanyConnection.put(this.state.schedule);
		newrev = savedSchedule.rev;
		const inschedule = this.state.schedule;
		inschedule['_rev'] = newrev;
		this.setState({ schedule: inschedule });
	}

	onChangeSchedule(newValue, prop) {
		switch(prop){
		case 'one':
			if (this.state.schedule.one === true) {
				this.state.schedule.one = false;
			} else {
				this.state.schedule.one = true;
			}
			break;
		case 'two':
			if (this.state.schedule.two === true) {
				this.state.schedule.two = false;
			} else {
				this.state.schedule.two = true;
			}
			break;
		case 'three':
			if (this.state.schedule.three === true) {
				this.state.schedule.three = false;
			} else {
				this.state.schedule.three = true;
			}
			break;
		case 'four':
			if (this.state.schedule.four === true) {
				this.state.schedule.four = false;
			} else {
				this.state.schedule.four = true;
			}
			break;
		case 'five':
			if (this.state.schedule.five === true) {
				this.state.schedule.five = false;
			} else {
				this.state.schedule.five = true;
			}
			break;
		case 'six':
			if (this.state.schedule.six === true) {
				this.state.schedule.six = false;
			} else {
				this.state.schedule.six = true;
			}
			break;
		case 'seven':
			if (this.state.schedule.seven === true) {
				this.state.schedule.seven = false;
			} else {
				this.state.schedule.seven = true;
			}
			break;
		case 'eight':
			if (this.state.schedule.eight === true) {
				this.state.schedule.eight = false;
			} else {
				this.state.schedule.eight = true;
			}
			break;
		case 'nine':
			if (this.state.schedule.nine === true) {
				this.state.schedule.nine = false;
			} else {
				this.state.schedule.nine = true;
			}
			break;
		case 'ten':
			if (this.state.schedule.ten === true) {
				this.state.schedule.ten = false;
			} else {
				this.state.schedule.ten = true;
			}
			break;
		case 'eleven':
			if (this.state.schedule.eleven === true) {
				this.state.schedule.eleven = false;
			} else {
				this.state.schedule.eleven = true;
			}
			break;
		case 'twelve':
			if (this.state.schedule.twelve === true) {
				this.state.schedule.twelve = false;
			} else {
				this.state.schedule.twelve = true;
			}
			break;
		case 'thirteen':
			if (this.state.schedule.thirteen === true) {
				this.state.schedule.thirteen = false;
			} else {
				this.state.schedule.thirteen = true;
			}
			break;
		case 'fourteen':
			if (this.state.schedule.fourteen === true) {
				this.state.schedule.fourteen = false;
			} else {
				this.state.schedule.fourteen = true;
			}
			break;
		case 'fiveteen':
			if (this.state.schedule.fiveteen === true) {
				this.state.schedule.fiveteen = false;
			} else {
				this.state.schedule.fiveteen = true;
			}
			break;
		case 'sixteen':
			if (this.state.schedule.sixteen === true) {
				this.state.schedule.sixteen = false;
			} else {
				this.state.schedule.sixteen = true;
			}
			break;
		case 'seventeen':
			if (this.state.schedule.seventeen === true) {
				this.state.schedule.seventeen = false;
			} else {
				this.state.schedule.seventeen = true;
			}
			break;
		case 'eighteen':
			if (this.state.schedule.eighteen === true) {
				this.state.schedule.eighteen = false;
			} else {
				this.state.schedule.eighteen = true;
			}
			break;
		case 'nineteen':
			if (this.state.schedule.nineteen === true) {
				this.state.schedule.nineteen = false;
			} else {
				this.state.schedule.nineteen = true;
			}
			break;
		case 'twenty':
			if (this.state.schedule.twenty === true) {
				this.state.schedule.twenty = false;
			} else {
				this.state.schedule.twenty = true;
			}
			break;
		case 'twentyone':
			if (this.state.schedule.twentyone === true) {
				this.state.schedule.twentyone = false;
			} else {
				this.state.schedule.twentyone = true;
			}
			break;
		case 'twentytwo':
			if (this.state.schedule.twentytwo === true) {
				this.state.schedule.twentytwo = false;
			} else {
				this.state.schedule.twentytwo = true;
			}
			break;
		case 'twentythree':
			if (this.state.schedule.twentythree === true) {
				this.state.schedule.twentythree = false;
			} else {
				this.state.schedule.twentythree = true;
			}
			break;
		case 'twentyfour':
			if (this.state.schedule.twentyfour === true) {
				this.state.schedule.twentyfour = false;
			} else {
				this.state.schedule.twentyfour = true;
			}
			break;
		case 'monday':
			this.headerWeeklyView = [];
			this.setState({ employeeWeekText: 'Select staff', employeeWeekSelected: '' });
			this.oneWeek = [];
			this.twoWeek = [];
			this.threeWeek = [];
			this.fourWeek = [];
			this.fiveWeek = [];
			this.sixWeek = [];
			this.sevenWeek = [];
			this.eightWeek = [];
			this.nineWeek = [];
			this.tenWeek = [];
			this.elevenWeek = [];
			this.twelveWeek = [];
			this.thirteenWeek = [];
			this.fourteenWeek = [];
			this.fiveteenWeek = [];
			this.sixteenWeek = [];
			this.seventeenWeek = [];
			this.eighteenWeek = [];
			this.nineteenWeek = [];
			this.twentyWeek = [];
			this.twentyoneWeek = [];
			this.twentytwoWeek = [];
			this.twentythreeWeek = [];
			this.twentyfourWeek = [];
			if (this.state.schedule.monday === true) {
				this.state.schedule.monday = false;
			} else {
				this.state.schedule.monday = true;
			}
			break;
		case 'tuesday':
			this.headerWeeklyView = [];
			this.setState({ employeeWeekText: 'Select staff', employeeWeekSelected: '' });
			this.oneWeek = [];
			this.twoWeek = [];
			this.threeWeek = [];
			this.fourWeek = [];
			this.fiveWeek = [];
			this.sixWeek = [];
			this.sevenWeek = [];
			this.eightWeek = [];
			this.nineWeek = [];
			this.tenWeek = [];
			this.elevenWeek = [];
			this.twelveWeek = [];
			this.thirteenWeek = [];
			this.fourteenWeek = [];
			this.fiveteenWeek = [];
			this.sixteenWeek = [];
			this.seventeenWeek = [];
			this.eighteenWeek = [];
			this.nineteenWeek = [];
			this.twentyWeek = [];
			this.twentyoneWeek = [];
			this.twentytwoWeek = [];
			this.twentythreeWeek = [];
			this.twentyfourWeek = [];
			if (this.state.schedule.tuesday === true) {
				this.state.schedule.tuesday = false;
			} else {
				this.state.schedule.tuesday = true;
			}
			break;
		case 'wednesday':
			this.headerWeeklyView = [];
			this.setState({ employeeWeekText: 'Select staff', employeeWeekSelected: '' });
			this.oneWeek = [];
			this.twoWeek = [];
			this.threeWeek = [];
			this.fourWeek = [];
			this.fiveWeek = [];
			this.sixWeek = [];
			this.sevenWeek = [];
			this.eightWeek = [];
			this.nineWeek = [];
			this.tenWeek = [];
			this.elevenWeek = [];
			this.twelveWeek = [];
			this.thirteenWeek = [];
			this.fourteenWeek = [];
			this.fiveteenWeek = [];
			this.sixteenWeek = [];
			this.seventeenWeek = [];
			this.eighteenWeek = [];
			this.nineteenWeek = [];
			this.twentyWeek = [];
			this.twentyoneWeek = [];
			this.twentytwoWeek = [];
			this.twentythreeWeek = [];
			this.twentyfourWeek = [];
			if (this.state.schedule.wednesday === true) {
				this.state.schedule.wednesday = false;
			} else {
				this.state.schedule.wednesday = true;
			}
			break;
		case 'thursday':
			this.headerWeeklyView = [];
			this.setState({ employeeWeekText: 'Select staff', employeeWeekSelected: '' });
			this.oneWeek = [];
			this.twoWeek = [];
			this.threeWeek = [];
			this.fourWeek = [];
			this.fiveWeek = [];
			this.sixWeek = [];
			this.sevenWeek = [];
			this.eightWeek = [];
			this.nineWeek = [];
			this.tenWeek = [];
			this.elevenWeek = [];
			this.twelveWeek = [];
			this.thirteenWeek = [];
			this.fourteenWeek = [];
			this.fiveteenWeek = [];
			this.sixteenWeek = [];
			this.seventeenWeek = [];
			this.eighteenWeek = [];
			this.nineteenWeek = [];
			this.twentyWeek = [];
			this.twentyoneWeek = [];
			this.twentytwoWeek = [];
			this.twentythreeWeek = [];
			this.twentyfourWeek = [];
			if (this.state.schedule.thursday === true) {
				this.state.schedule.thursday = false;
			} else {
				this.state.schedule.thursday = true;
			}
			break;
		case 'friday':
			this.headerWeeklyView = [];
			this.setState({ employeeWeekText: 'Select staff', employeeWeekSelected: '' });
			this.oneWeek = [];
			this.twoWeek = [];
			this.threeWeek = [];
			this.fourWeek = [];
			this.fiveWeek = [];
			this.sixWeek = [];
			this.sevenWeek = [];
			this.eightWeek = [];
			this.nineWeek = [];
			this.tenWeek = [];
			this.elevenWeek = [];
			this.twelveWeek = [];
			this.thirteenWeek = [];
			this.fourteenWeek = [];
			this.fiveteenWeek = [];
			this.sixteenWeek = [];
			this.seventeenWeek = [];
			this.eighteenWeek = [];
			this.nineteenWeek = [];
			this.twentyWeek = [];
			this.twentyoneWeek = [];
			this.twentytwoWeek = [];
			this.twentythreeWeek = [];
			this.twentyfourWeek = [];
			if (this.state.schedule.friday === true) {
				this.state.schedule.friday = false;
			} else {
				this.state.schedule.friday = true;
			}
			break;
		case 'saturday':
			this.headerWeeklyView = [];
			this.setState({ employeeWeekText: 'Select staff', employeeWeekSelected: '' });
			this.oneWeek = [];
			this.twoWeek = [];
			this.threeWeek = [];
			this.fourWeek = [];
			this.fiveWeek = [];
			this.sixWeek = [];
			this.sevenWeek = [];
			this.eightWeek = [];
			this.nineWeek = [];
			this.tenWeek = [];
			this.elevenWeek = [];
			this.twelveWeek = [];
			this.thirteenWeek = [];
			this.fourteenWeek = [];
			this.fiveteenWeek = [];
			this.sixteenWeek = [];
			this.seventeenWeek = [];
			this.eighteenWeek = [];
			this.nineteenWeek = [];
			this.twentyWeek = [];
			this.twentyoneWeek = [];
			this.twentytwoWeek = [];
			this.twentythreeWeek = [];
			this.twentyfourWeek = [];
			if (this.state.schedule.saturday === true) {
				this.state.schedule.saturday = false;
			} else {
				this.state.schedule.saturday = true;
			}
			break;
		case 'sunday':
			this.headerWeeklyView = [];
			this.setState({ employeeWeekText: 'Select staff', employeeWeekSelected: '' });
			this.oneWeek = [];
			this.twoWeek = [];
			this.threeWeek = [];
			this.fourWeek = [];
			this.fiveWeek = [];
			this.sixWeek = [];
			this.sevenWeek = [];
			this.eightWeek = [];
			this.nineWeek = [];
			this.tenWeek = [];
			this.elevenWeek = [];
			this.twelveWeek = [];
			this.thirteenWeek = [];
			this.fourteenWeek = [];
			this.fiveteenWeek = [];
			this.sixteenWeek = [];
			this.seventeenWeek = [];
			this.eighteenWeek = [];
			this.nineteenWeek = [];
			this.twentyWeek = [];
			this.twentyoneWeek = [];
			this.twentytwoWeek = [];
			this.twentythreeWeek = [];
			this.twentyfourWeek = [];
			if (this.state.schedule.sunday === true) {
				this.state.schedule.sunday = false;
			} else {
				this.state.schedule.sunday = true;
			}
			break;
		}
		const inschedule = this.state.schedule;
		this.setState({ schedule: inschedule });
		this.saveSchedule();
	}

	async showScaleAnimationDialog(item) {
		this.treatmentslist = '';
		this.treatmentslistinfo = [];
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
			if (item.appointment[0].doctype === 'appointmentamended') {
				const queryAppointment = { selector: { doctype: 'appointment', _id: item.appointment[0].appointment_id }, };
				const appointmentInfo = await DBCompanyConnection.find(queryAppointment);
				this.appointmentInfo = {};
				this.appointmentInfo.hour = appointmentInfo.docs[0].hour;
				this.appointmentInfo.minute = appointmentInfo.docs[0].minute;
				const contactinfo = await DBCompanyConnection.find(this.queryContacts);
				if (contactinfo.docs.length > 0) {
					appointmentInfo.docs[0].contact_name = contactinfo.docs[0].givenName + ' ' + contactinfo.docs[0].familyName;
				}
				const queryEmployee = { selector: { doctype: 'user', _id: appointmentInfo.docs[0].employee_id }, };
				const employeeInfo = await DBCompanyConnection.find(queryEmployee);
				if (employeeInfo.docs.length > 0) {
					if (_.isEmpty(appointmentInfo.docs[0].employee_alias)) {
						appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].alias;
						if (appointmentInfo.docs[0].alias === '') {
							appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].name;
							if (appointmentInfo.docs[0].name === '') {
								appointmentInfo.docs[0].employee_alias = employeeInfo.docs[0].email;
							}
						}
					}
				}
				appointmentInfo.docs[0].hour = item.appointment[0].hour;
				appointmentInfo.docs[0].minute = item.appointment[0].minute;
				this.treatmentslist = '';
				const queryTreatmentsAppointment = { selector: { doctype: 'treatment', _id: item.appointment[0].treatment_id }, };
				const treatmentInfo = await DBCompanyConnection.find(queryTreatmentsAppointment);
				for (let t = 0; t < treatmentInfo.docs.length; t += 1) {
					if (this.treatmentslist === '') {
						this.treatmentslist = `${treatmentInfo.docs[t].name}`;
					} else {
						this.treatmentslist = `${this.treatmentslist}, ${treatmentInfo.docs[t].name}`;
					}
				}
				appointmentInfo.docs[0].doctype = 'appointmentamended';
				this.treatmentslistinfo = treatmentInfo.docs;
				this.setState({ appointment: appointmentInfo.docs[0], mainappointment: this.appointmentInfo });
			} else {
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
		}
		if (item.time === false) {
			this.scaleAnimationDialog.show();
		}
	}
	
	showEmployeesList(dashboardTab) {
		if (dashboardTab === 'daily') {
			Actions.AppointmentsEmployeesList({
				title: 'Employees list',
				appointmentsdate: this.state.todaysDate,
				area: 'dashboard',
				tab: dashboardTab
			});
		} else if (dashboardTab === 'weekly') {
			Actions.AppointmentsEmployeesList({
				title: 'Employees list',
				appointmentsdate: this.state.todaysDate,
				area: 'dashboard',
				tab: dashboardTab,
				mondayOfWeek: this.state.mondayOfWeek,
				weekdatefrom: this.state.weekdatefrom,
				weekdateto: this.state.weekdateto,
				weekSelectedDate: this.state.weekSelectedDate,
				weekDate: this.state.weekDate
			});
		}
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
			newappointment.employee_alias = this.state.appointment.employee_alias;
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
		if (this.state.appointment.doctype === 'appointment') {
			const appointmentDeleted = await DBCompanyConnection.remove(this.state.appointment);
			this.queryTreatmentAppointment = { selector: { doctype: 'treatment', appointment_id: this.state.appointment._id, treatment_id: this.state.appointment.treatment_id }, };
			const appointmentTreatment = await DBCompanyConnection.find(this.queryTreatmentAppointment);
			if (appointmentTreatment.docs.length > 0) {
				for (let t = 0; t < appointmentTreatment.docs.length; t += 1) {
					const appointmentTreatmentDeleted = await DBCompanyConnection.remove(appointmentTreatment.docs[t]);
				}
			}
			const queryappointmentsamended = { selector: { doctype: 'appointmentamended', appointment_id: this.state.appointment._id }, };
			const appointmentsamendedinfo = await DBCompanyConnection.find(queryappointmentsamended);
			if (appointmentsamendedinfo.docs.length > 0) {
				for (let a = 0; a < appointmentsamendedinfo.docs.length; a += 1) {
					appointmentsamendedinfo.docs[a].hour = Math.round(appointmentsamendedinfo.docs[a].hour * 100) / 100;
					if (parseInt(appointmentsamendedinfo.docs[a].minute < 10)) {
						appointmentsamendedinfo.docs[a].minute = Math.round(appointmentsamendedinfo.docs[a].minute * 100) / 100;
					}
				}
			}
			appointmentsamendedinfo.docs = _.sortBy(appointmentsamendedinfo.docs, ['hour', 'minute']);
			if (!_.isEmpty(appointmentsamendedinfo.docs[0])) {
				appointmentsamendedinfo.docs[0] = _.omit(appointmentsamendedinfo.docs[0], ['appointment_id']);								
				appointmentsamendedinfo.docs[0].doctype = 'appointment';
				this.newhour = parseInt(appointmentsamendedinfo.docs[0].hour);
				this.newminutes = parseInt(appointmentsamendedinfo.docs[0].minute);
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
				appointmentsamendedinfo.docs[0].hour = this.newhour;
				appointmentsamendedinfo.docs[0].minute = this.newminutes;
				const updatedappointment = await DBCompanyConnection.put(appointmentsamendedinfo.docs[0]);
				this.queryTreatmentsAppointment = { selector: { doctype: 'treatment', appointment_id: this.state.appointment._id }, };
				const appointmentTreatments = await DBCompanyConnection.find(this.queryTreatmentsAppointment);
				if (appointmentTreatments.docs.length > 0) {
					for (let t = 0; t < appointmentTreatments.docs.length; t += 1) {
						appointmentTreatments.docs[t].appointment_id = appointmentsamendedinfo.docs[0]._id;
						const treatmentUpdated = await DBCompanyConnection.put(appointmentTreatments.docs[t]);
					}
				}
				const queryAppointmentImages = { selector: { doctype: 'images', area: 'appointment', owner: this.state.appointment._id }, };
				const appointmentimages = await DBCompanyConnection.find(queryAppointmentImages);
				if (appointmentimages.docs.length > 0) {
					for (let i = 0; i < appointmentimages.docs.length; i += 1) {
						appointmentimages.docs[i].owner = appointmentsamendedinfo.docs[0]._id;
						const imageUpdated = await DBCompanyConnection.put(appointmentimages.docs[i]);
					}
				}
			}
		} else {
			const appointmentDeleted = await DBCompanyConnection.remove(this.state.appointment);
			this.queryTreatmentAppointment = { selector: { doctype: 'treatment', appointment_id: this.state.appointment.appointment_id, treatment_id: this.state.appointment.treatment_id }, };
			const appointmentTreatment = await DBCompanyConnection.find(this.queryTreatmentAppointment);
			if (appointmentTreatment.docs.length > 0) {
				for (let t = 0; t < appointmentTreatment.docs.length; t += 1) {
					const appointmentTreatmentDeleted = await DBCompanyConnection.remove(appointmentTreatment.docs[t]);
				}
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

	cancelCalendar() {
		this.setState({ showWeekCalendar: false, weekDate: 'Select week' });
	}

	showWeekCalendar(action) {
		this.setState({ showWeekCalendar: action });
		if (this.state.weekDate !== 'Select week') {
			if (_.isEmpty(this.selectedDate)) {
				this.selectedDate = this.state.weekDate;
			}
			this.setState({ showspinner: false });
			this.setState({ showWeekCalendar: action, weekSelectedDate: this.state.weekSelectedDate, weekDate: this.selectedDate });
		}
		if (!_.isEmpty(this.state.weekDate)) {
			this.showData();
		}
		
	}

	weekDateChange(date) {
		this.state.weekSelectedDate = [];
		this.selectedDate = moment(date).format('YYYY-MM-DD');
		this.mondayOfWeek = moment(this.selectedDate).startOf('isoweek').toDate();
		this.mondayOfWeekFormated = moment(this.mondayOfWeek).format('YYYY-MM-DD');
		this.sundayOfWeek = moment(this.selectedDate).endOf('isoweek').toDate();
		this.sundayOfWeekFormated = moment(this.sundayOfWeek).format('YYYY-MM-DD');
		this.selectedDate = moment(this.mondayOfWeek).format('DD-MM-YY')+'/'+moment(this.sundayOfWeek).format('DD-MM-YY');
		this.state.weekSelectedDate.push(this.mondayOfWeekFormated);
		this.tuesday = moment(this.mondayOfWeek).add(1, 'days').format('YYYY-MM-DD');
		this.state.weekSelectedDate.push(this.tuesday);
		this.wednesday = moment(this.mondayOfWeek).add(2, 'days').format('YYYY-MM-DD');
		this.state.weekSelectedDate.push(this.wednesday);
		this.thursday = moment(this.mondayOfWeek).add(3, 'days').format('YYYY-MM-DD');
		this.state.weekSelectedDate.push(this.thursday);
		this.friday = moment(this.mondayOfWeek).add(4, 'days').format('YYYY-MM-DD');
		this.state.weekSelectedDate.push(this.friday);
		this.saturday = moment(this.mondayOfWeek).add(5, 'days').format('YYYY-MM-DD');
		this.state.weekSelectedDate.push(this.saturday);
		this.sunday = moment(this.mondayOfWeek).add(6, 'days').format('YYYY-MM-DD');
		this.state.weekSelectedDate.push(this.sunday);
		this.weekdatefrom = moment(this.mondayOfWeek).format('DD-MM-YYYY');
		this.weekdateto = moment(this.sundayOfWeek).format('DD-MM-YYYY');
		this.setState({ weekDate: this.selectedDate, weekdatefrom: this.weekdatefrom, weekdateto: this.weekdateto, mondayOfWeek: this.mondayOfWeek });
		this.showWeekCalendar(true);
	}

	renderDialogButtons() {
		if (this.state.appointment.doctype === 'appointmentamended') {
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
					<ActionButton.Item buttonColor="steelblue" title="View details" onPress={() => { Actions.AppointmentsInfo({ appointmentid: this.state.appointment._id, title: 'Appointment', appointmentdate: this.state.todaysDate }); }}>
						<IconMaterial name="pageview" size={28} color="white" />
					</ActionButton.Item>
					<ActionButton.Item buttonColor="#f08080" title="Delete appointment" onPress={() => { this.deleteAppointmentConfirmationAlert(); }}>
						<IconMaterial name="delete" size={28} color="white" />
					</ActionButton.Item>
				</ActionButton>
			);
		} else {
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
					<ActionButton.Item buttonColor="steelblue" title="View details" onPress={() => { Actions.AppointmentsInfo({ appointmentid: this.state.appointment._id, title: 'Appointment', appointmentdate: this.state.todaysDate }); }}>
						<IconMaterial name="pageview" size={28} color="white" />
					</ActionButton.Item>
					<ActionButton.Item buttonColor="#f08080" title="Delete appointment" onPress={() => { this.deleteAppointmentConfirmationAlert(); }}>
						<IconMaterial name="delete" size={28} color="white" />
					</ActionButton.Item>
				</ActionButton>
			);
		}
	}

	renderPopupDialog() {
		if (this.state.appointment.doctype === 'appointmentamended') {
			return (
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
						<Text style={{ marginTop: 20 }}>
							{this.state.appointment.date}
						</Text>
						<View
							style={{
								flexDirection: 'row',
								marginTop: 20,
								alignSelf: 'flex-start'
							}}
						>
							<Text note style={{ marginRight: 30, fontStyle: 'italic' }}>This is an extension of the appointment at {this.state.mainappointment.hour}:{this.state.mainappointment.minute} and cannot be edited from this area, click view details if you need to do it.</Text> 
						</View>
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
							<Text
								style={{
									marginTop: 25,
									marginLeft: 20,
								}}
							>
								{this.state.appointment.hour}
							</Text>
							<Text
								style={{
									marginTop: 25,
									marginLeft: 20,
									fontWeight: 'bold',
								}}
							>
								Minute
							</Text>
							<Text
								style={{
									marginTop: 25,
									marginLeft: 20,
								}}
							>
								{this.state.appointment.minute}
							</Text>
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
							<Text
								style={{
									marginTop: 25,
									marginLeft: 20,
								}}
							>
								{this.state.appointment.contact_name}
							</Text>
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
							>Staff</Text>
							<Text
								style={{
									marginTop: 25,
									marginLeft: 20,
								}}
							>
								{this.state.appointment.employee_alias}
							</Text>
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
								disabled
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
								value={this.state.appointment.notes}
							/>
						</View>
					</View>
					{this.renderDialogButtons()}
				</PopupDialog>
			);
		}
		return (
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
						>Staff</Text>
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
		);
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
								<TouchableOpacity onPress={this.showEmployeesList.bind(this, 'daily')} style={{ height: 40 }}>
									<View style={{ flexDirection: 'row', flex: 1, padding: 10, borderColor: '#C0C0C0', borderWidth: 1, borderRadius: 6 }}>
										<Text>{this.state.employeesListText}</Text>
										<MaterialCommunityIcons name="arrow-down-drop-circle-outline" size={20} style={{ color: '#CCCCCC' }} />
									</View>
								</TouchableOpacity>
							</View>
						</View>
						<KeyboardAwareScrollView>
						<Content style={{ minHeight: 800 }} >
							{this.renderPopupDialog()}
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
							{this.state.employeesListText === 'Select staff' && this.state.showspinner === false &&
								<Text style={{ padding: 40 }}>Please select staff from the list</Text>
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
								{this.state.schedule.one === true &&
									<Row>
										<FlatList
											data={this.one}
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
									}
									{this.state.schedule.two === true &&
									<Row>
										<FlatList
											data={this.two}
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
									}
									{this.state.schedule.three === true &&
									<Row>
										<FlatList
											data={this.three}
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
									}
									{this.state.schedule.four === true &&
									<Row>
										<FlatList
											data={this.four}
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
									}
									{this.state.schedule.five === true &&
									<Row>
										<FlatList
											data={this.five}
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
									}
									{this.state.schedule.six === true &&
									<Row>
										<FlatList
											data={this.six}
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
									}
									{this.state.schedule.seven === true &&
									<Row>
										<FlatList
											data={this.seven}
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
									}
									{this.state.schedule.eight === true &&
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
									}
									{this.state.schedule.nine === true &&
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
									}
									{this.state.schedule.ten === true &&
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
									}
									{this.state.schedule.eleven === true &&
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
									}
									{this.state.schedule.twelve === true &&
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
									}
									{this.state.schedule.thirteen === true &&
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
									}
									{this.state.schedule.fourteen === true &&
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
									}
									{this.state.schedule.fiveteen === true &&
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
									}
									{this.state.schedule.sixteen === true &&
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
									}
									{this.state.schedule.seventeen === true &&
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
									}
									{this.state.schedule.eighteen === true &&
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
									}
									{this.state.schedule.nineteen === true &&
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
									}
									{this.state.schedule.twenty === true &&
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
									}
									{this.state.schedule.twentyone === true &&
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
									}
									{this.state.schedule.twentytwo === true &&
									<Row>
										<FlatList
											data={this.twentytwo}
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
									}
									{this.state.schedule.twentythree === true &&
									<Row>
										<FlatList
											data={this.twentythree}
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
									}
									{this.state.schedule.twentyfour === true &&
									<Row>
										<FlatList
											data={this.twentyfour}
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
									}
							</Grid>	
							}
							<View style={{ height: 60 }} />
						</Content>
						</KeyboardAwareScrollView>
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>Weekly</Text></TabHeading>}>
						<View style={{ borderColor: 'steelblue', borderBottomWidth: 2, height: 54 }}>
							<View
								style={{
									paddingTop: 5,
									paddingLeft: 10,
									paddingRight: 10,
									paddingBottom: 6,
									flexDirection: 'row',
								}}
							>
								<TouchableOpacity onPress={this.showWeekCalendar.bind(this, true)} style={{ height: 40 }}>
									<View
										style={{
											flexDirection: 'row',
										}}
									>
										<Text
											style={{
												flexDirection: 'row',
												padding: 10,
												height: 40,
												borderColor: '#C0C0C0',
												borderWidth: 1,
												borderRadius: 6
											}}
										>
											{this.state.weekDate}
										</Text>
										<Image
											style={{
												marginTop: 2.5,
												marginLeft: 5,
												marginRight: 5,
												width: 33,
												height: 33,
											}}
											source={require('../img/dateicon.png')}
										/>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={this.showEmployeesList.bind(this, 'weekly')} style={{ height: 40 }}>
									<View style={{ flexDirection: 'row', flex: 0.4, padding: 10, borderColor: '#C0C0C0', borderWidth: 1, borderRadius: 6 }}>
										<Text>{this.state.employeeWeekText}</Text>
										<MaterialCommunityIcons name="arrow-down-drop-circle-outline" size={20} style={{ color: '#CCCCCC' }} />
									</View>
								</TouchableOpacity>
							</View>
						</View>
						<KeyboardAwareScrollView>
						<Content style={{ minHeight: 800 }} >
							{this.state.showWeekCalendar === true &&
								<View style={{ borderWidth: 1, borderColor: '#C0C0C0', borderRadius: 6 }}>
									<Calendar
										showEventIndicators
										customStyle={{
											hasEventCircle: {
												backgroundColor: '#9DBDF2',
											},
											weekendDayText: {
												color: 'black',
											},
											hasEventDaySelectedCircle: {
												backgroundColor: 'red',
											}
										}}
										ref="calendar"
										scrollEnabled
										showControls={true}
										prevButtonText={'Prev'}
										nextButtonText={'Next'}
										eventDates={this.state.weekSelectedDate}
										onDateSelect={(date) => this.weekDateChange(date)}
										onDateLongPress={(date) => this.setState({ selectedDate: date })}
										onTouchPrev={(e) => console.log('onTouchPrev: ', e)}
										onTouchNext={(e) => console.log('onTouchNext: ', e)}
										onSwipePrev={(e) => console.log('onSwipePrev: ', e)}
										onSwipeNext={(e) => console.log('onSwipeNext', e)}
										selectedDate={this.state.selectedDate}
									/>
									<View style={{ flexDirection: 'row', flex: 1, marginHorizontal: 20, marginVertical: 10 }}>
										<Left>
											<Text style={{ fontSize: 16, color: '#666' }} onPress={this.cancelCalendar.bind(this)} >Cancel</Text>
										</Left>
										<Right>
											<Text style={{ fontSize: 16, color: '#46cf98' }} onPress={this.showWeekCalendar.bind(this, false)} >Ok</Text>
										</Right>
									</View>
								</View>
							}
							{this.renderPopupDialog()}
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
							{this.state.employeeWeekText === 'Select staff' && this.state.weekDate === 'Select week' && this.state.showspinner === false && this.state.showWeekCalendar === false &&
								<Text style={{ borderColor: '#d7d7d6', padding: 40 }}>Please select one staff from the list and one week from the calendar</Text>
							}
							{this.state.employeeWeekText === 'Select staff' && this.state.weekDate !== 'Select week' && this.state.showspinner === false && this.state.showWeekCalendar === false &&
								<Text style={{ borderColor: '#d7d7d6', padding: 40 }}>Please select one staff from the list</Text>
							}
							{this.state.employeeWeekText !== 'Select staff' && this.state.weekDate === 'Select week' && this.state.showspinner === false && this.state.showWeekCalendar === false &&
								<Text style={{ borderColor: '#d7d7d6', padding: 40 }}>Please select one week from the calendar</Text>
							}
							{this.state.employeeWeekText !== 'Select staff' && this.state.weekDate !== 'Select week' && this.state.showspinner === false && this.state.showWeekCalendar === false &&
							<Grid style={{ borderColor: '#d7d7d6', borderWidth: 0.5 }}>
								<Row>
									<FlatList
										data={this.headerWeeklyView}
										renderItem={({item}) => (
											<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: 'steelblue' }}>
												<Text note style={{ fontSize: 9, textAlign: 'center', color: 'white', fontWeight: 'bold' }} >
													{item.label}
												</Text>
											</View>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
							{this.state.schedule.one === true &&
								<Row>
									<FlatList
										data={this.oneWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.two === true &&
								<Row>
									<FlatList
										data={this.twoWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.three === true &&
								<Row>
									<FlatList
										data={this.threeWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.four === true &&
								<Row>
									<FlatList
										data={this.fourWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.five === true &&
								<Row>
									<FlatList
										data={this.fiveWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.six === true &&
								<Row>
									<FlatList
										data={this.sixWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.seven === true &&
								<Row>
									<FlatList
										data={this.sevenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.eight === true &&
								<Row>
									<FlatList
										data={this.eightWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.nine === true &&
								<Row>
									<FlatList
										data={this.nineWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.ten === true &&
								<Row>
									<FlatList
										data={this.tenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.eleven === true &&
								<Row>
									<FlatList
										data={this.elevenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.twelve === true &&
								<Row>
									<FlatList
										data={this.twelveWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.thirteen === true &&
								<Row>
									<FlatList
										data={this.thirteenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.fourteen === true &&
								<Row>
									<FlatList
										data={this.fourteenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.fiveteen === true &&
								<Row>
									<FlatList
										data={this.fiveteenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.sixteen === true &&
								<Row>
									<FlatList
										data={this.sixteenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.seventeen === true &&
								<Row>
									<FlatList
										data={this.seventeenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.eighteen === true &&
								<Row>
									<FlatList
										data={this.eighteenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.nineteen === true &&
								<Row>
									<FlatList
										data={this.nineteenWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.twenty === true &&
								<Row>
									<FlatList
										data={this.twentyWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.twentyone === true &&
								<Row>
									<FlatList
										data={this.twentyoneWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.twentytwo === true &&
								<Row>
									<FlatList
										data={this.twentytwoWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.twentythree === true &&
								<Row>
									<FlatList
										data={this.twentythreeWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
								{this.state.schedule.twentyfour === true &&
								<Row>
									<FlatList
										data={this.twentyfourWeek}
										renderItem={({item}) => (
											<TouchableOpacity onPress={() => this.showScaleAnimationDialog(item) } >
												<View style={{ justifyContent: 'center', borderColor: '#d7d7d6', borderWidth: 0.5, height: 35, width: fullWidth/this.state.employeeWeekSelectedCount, backgroundColor: this.backgroundColor }}>
													<Text note style={{ fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: this.textColor }} >
														{item.label}
													</Text>
												</View>
											</TouchableOpacity>
										)}
										keyExtractor={item => item._id}
										numColumns={this.state.employeeWeekSelectedCount} />
								</Row>
								}
							</Grid>	
							}
							<View style={{ height: 60 }} />
						</Content>
						</KeyboardAwareScrollView>
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
									checked={this.state.schedule.one}
									onPress={() => { this.onChangeSchedule(this.state.schedule.one, 'one'); }}
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
									checked={this.state.schedule.two}
									onPress={() => { this.onChangeSchedule(this.state.schedule.two, 'two'); }}
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
									checked={this.state.schedule.three}
									onPress={() => { this.onChangeSchedule(this.state.schedule.three, 'three'); }}
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
									checked={this.state.schedule.four}
									onPress={() => { this.onChangeSchedule(this.state.schedule.four, 'four'); }}
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
									checked={this.state.schedule.five}
									onPress={() => { this.onChangeSchedule(this.state.schedule.five, 'five'); }}
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
									checked={this.state.schedule.six}
									onPress={() => { this.onChangeSchedule(this.state.schedule.six, 'six'); }}
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
									checked={this.state.schedule.seven}
									onPress={() => { this.onChangeSchedule(this.state.schedule.seven, 'seven'); }}
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
									checked={this.state.schedule.eight}
									onPress={() => { this.onChangeSchedule(this.state.schedule.eight, 'eight'); }}
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
									checked={this.state.schedule.nine}
									onPress={() => { this.onChangeSchedule(this.state.schedule.nine, 'nine'); }}
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
									checked={this.state.schedule.ten}
									onPress={() => { this.onChangeSchedule(this.state.schedule.ten, 'ten'); }}
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
									checked={this.state.schedule.eleven}
									onPress={() => { this.onChangeSchedule(this.state.schedule.eleven, 'eleven'); }}
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
									checked={this.state.schedule.twelve}
									onPress={() => { this.onChangeSchedule(this.state.schedule.twelve, 'twelve'); }}
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
									checked={this.state.schedule.thirteen}
									onPress={() => { this.onChangeSchedule(this.state.schedule.thirteen, 'thirteen'); }}
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
									checked={this.state.schedule.fourteen}
									onPress={() => { this.onChangeSchedule(this.state.schedule.fourteen, 'fourteen'); }}
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
									checked={this.state.schedule.fiveteen}
									onPress={() => { this.onChangeSchedule(this.state.schedule.fiveteen, 'fiveteen'); }}
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
									checked={this.state.schedule.sixteen}
									onPress={() => { this.onChangeSchedule(this.state.schedule.sixteen, 'sixteen'); }}
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
									checked={this.state.schedule.seventeen}
									onPress={() => { this.onChangeSchedule(this.state.schedule.seventeen, 'seventeen'); }}
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
									checked={this.state.schedule.eighteen}
									onPress={() => { this.onChangeSchedule(this.state.schedule.eighteen, 'eighteen'); }}
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
									checked={this.state.schedule.nineteen}
									onPress={() => { this.onChangeSchedule(this.state.schedule.nineteen, 'nineteen'); }}
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
									checked={this.state.schedule.twenty}
									onPress={() => { this.onChangeSchedule(this.state.schedule.twenty, 'twenty'); }}
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
									checked={this.state.schedule.twentyone}
									onPress={() => { this.onChangeSchedule(this.state.schedule.twentyone, 'twentyone'); }}
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
									checked={this.state.schedule.twentytwo}
									onPress={() => { this.onChangeSchedule(this.state.schedule.twentytwo, 'twentytwo'); }}
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
									checked={this.state.schedule.twentythree}
									onPress={() => { this.onChangeSchedule(this.state.schedule.twentythree, 'twentythree'); }}
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
									checked={this.state.schedule.twentyfour}
									onPress={() => { this.onChangeSchedule(this.state.schedule.twentyfour, 'twentyfour'); }}
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
									checked={this.state.schedule.monday}
									onPress={() => { this.onChangeSchedule(this.state.schedule.monday, 'monday'); }}
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
									checked={this.state.schedule.tuesday}
									onPress={() => { this.onChangeSchedule(this.state.schedule.tuesday, 'tuesday'); }}
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
									checked={this.state.schedule.wednesday}
									onPress={() => { this.onChangeSchedule(this.state.schedule.wednesday, 'wednesday'); }}
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
									checked={this.state.schedule.thursday}
									onPress={() => { this.onChangeSchedule(this.state.schedule.thursday, 'thursday'); }}
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
									checked={this.state.schedule.friday}
									onPress={() => { this.onChangeSchedule(this.state.schedule.friday, 'friday'); }}
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
									checked={this.state.schedule.saturday}
									onPress={() => { this.onChangeSchedule(this.state.schedule.saturday, 'saturday'); }}
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
									checked={this.state.schedule.sunday}
									onPress={() => { this.onChangeSchedule(this.state.schedule.sunday, 'sunday'); }}
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
