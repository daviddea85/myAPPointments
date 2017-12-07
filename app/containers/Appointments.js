import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, AsyncStorage, ListView, View, TextInput, TouchableOpacity, Dimensions, Keyboard } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab, Tabs, Tab, TabHeading, Badge, Right, Label, Picker, Item, ListItem, Spinner  } from 'native-base';
import { Actions } from 'react-native-router-flux';
import ActionButton from 'react-native-action-button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import DatePicker from 'react-native-datepicker';
import PouchDB from 'pouchdb-react-native';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
import moment from 'moment';
import ModalPicker from './common/ModalPicker';

import styles from './common/ModalPickerStyle';

const Permissions = require('react-native-permissions');

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

PouchDB.plugin(require('pouchdb-find'));
let DBCompanyConnection = null;

class Appointments extends Component {

	constructor(props) {
		super(props);
		this.floatingBtn = null;
		const dsAppointmentsList = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			appointmentsListCount: 0,
			appointmentsList: dsAppointmentsList.cloneWithRows([]),
			showspinner: false,
			showspinnertext: 'Loading appointments, please wait',
			todaysDate: this.props.appointmentsdate || '',
			userSelected: this.props.userSelected || '',
		};
		this.companyDatabase = '';
		this.userLoggedId = '';
	}

	componentWillMount() {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {
						this.userLoggedId = userLoggedIdValue;
						if (_.isEmpty(this.props.userSelected)) {
							this.userSelected = {
								key: '',
								value: '',
								label: 'All employees'
							};
						} else {
							this.userSelected = this.props.userSelected;
						}
						if (_.isEmpty(this.state.todaysDate)) {
							this.setState({ todaysDate: moment().format('DD-MM-YYYY'), userSelected: this.userSelected });
						} else {
							this.setState({ todaysDate: this.state.todaysDate, userSelected: this.userSelected });
						}
						this.connectCompanyDb(true);
					}
				});
			} else {
				Actions.Login();
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.goBack === true) {
			if (_.isEmpty(this.props.userSelected)) {
				this.userSelected = {
					key: '',
					value: '',
					label: 'All employees'
				};
			} else {
				this.userSelected = this.props.userSelected;
			}
			this.setState({ userSelected: this.userSelected });
			this.connectCompanyDb(true);
		}
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {
						this.userLoggedId = userLoggedIdValue;
						if (_.isEmpty(this.props.userSelected)) {
							this.userSelected = {
								key: '',
								value: '',
								label: 'All employees'
							};
						} else {
							this.userSelected = this.props.userSelected;
						}
						if (_.isEmpty(this.state.todaysDate)) {
							this.setState({ todaysDate: moment().format('DD-MM-YYYY'), userSelected: this.userSelected });
						} else {
							this.setState({ todaysDate: this.state.todaysDate, userSelected: this.userSelected });
						}
						this.connectCompanyDb(true);
					}
				});
			} else {
				Actions.Login();
			}
		});
	}

	componentDidUpdate() {}

	componentWillUnmount() {}

	onChangeAppointmentDate(newValue, prop) {
		this.setState({ todaysDate: newValue, showspinner: true });
		this.getAppointments(newValue);
	}

	async getAppointments(dateValue) {
		if (dateValue) {
			this.state.todaysDate = dateValue;
		}
		const dsAppointmentsList = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		if (this.state.userSelected.value === '') {
			this.queryAppointments = { selector: { doctype: 'appointment', date: this.state.todaysDate }, };
		} else {
			this.queryAppointments = { selector: { doctype: 'appointment', date: this.state.todaysDate, employee_id: this.state.userSelected.value }, };
		}
		const appointmentsList = await DBCompanyConnection.find(this.queryAppointments);
		if (appointmentsList.docs.length > 0) {
			for (let i = 0; i < appointmentsList.docs.length; i += 1) {
				const queryContact = { selector: { doctype: 'contact', _id: appointmentsList.docs[i].contact_id }, };
				const contactInfo = await DBCompanyConnection.find(queryContact);
				appointmentsList.docs[i].contact_name = 'Missing contact';
				if (contactInfo.docs.length > 0) {
					appointmentsList.docs[i].contact_name = contactInfo.docs[0].givenName +' '+ contactInfo.docs[0].familyName;
					appointmentsList.docs[i].telephone = '';
					if (contactInfo.docs[0].phoneNumbers.length > 0) {
						this.contactfound = _.filter(contactInfo.docs[0].phoneNumbers, { label : 'mobile' });
						if (this.contactfound.length > 0) {
							appointmentsList.docs[i].telephone = contactInfo.docs[0].phoneNumbers[0].number;
						} else {
							appointmentsList.docs[i].telephone = contactInfo.docs[0].phoneNumbers[0].number;
						}
					}
				}
				if (appointmentsList.docs[i].employee_id !== '') {
					const queryEmployee = { selector: { doctype: 'user', _id: appointmentsList.docs[i].employee_id }, };
					const employeeInfo = await DBCompanyConnection.find(queryEmployee);
					appointmentsList.docs[i].employee_alias = 'Missing employee';
					if (employeeInfo.docs.length > 0) {
						appointmentsList.docs[i].employee_alias = employeeInfo.docs[0].alias;
						if (employeeInfo.docs[0].alias === '') {
							appointmentsList.docs[i].employee_alias = employeeInfo.docs[0].name;
							if (employeeInfo.docs[0].name === '') {
								appointmentsList.docs[i].employee_alias = employeeInfo.docs[0].email;
							}
						}
					}
				}
				const queryTreatmentsAppointment = { selector: { doctype: 'treatment', appointment_id: appointmentsList.docs[i]._id }, };
				const treatmentInfo = await DBCompanyConnection.find(queryTreatmentsAppointment);
				appointmentsList.docs[i].treatmentslist = '';
				for (let t = 0; t < treatmentInfo.docs.length; t += 1) {
					if (appointmentsList.docs[i].treatmentslist === '') {
						appointmentsList.docs[i].treatmentslist = `${treatmentInfo.docs[t].name}`;
					} else {
						appointmentsList.docs[i].treatmentslist = `${appointmentsList.docs[i].treatmentslist}, ${treatmentInfo.docs[t].name}`;
					}
				}
				appointmentsList.docs[i].hour = Math.round(appointmentsList.docs[i].hour * 100) / 100;
				if (parseInt(appointmentsList.docs[i].minute < 10)) {
					appointmentsList.docs[i].minute = Math.round(appointmentsList.docs[i].minute * 100) / 100;
				}
			}
			appointmentsList.docs = _.sortBy(appointmentsList.docs, ['hour', 'minute']);
			this.setState({ appointmentsList: dsAppointmentsList.cloneWithRows(appointmentsList.docs), appointmentsListCount: appointmentsList.docs.length});
		} else {
			this.setState({ appointmentsList: dsAppointmentsList.cloneWithRows([]), appointmentsListCount: 0 });
		}
		this.setState({ showspinner: false });
	}

	createNewAppointment() {
		Actions.AppointmentsInfo({ appointmentid: '', title: 'Add appointment', appointmentdate: this.todaysDate  });
	}

	connectCompanyDb(isConnected) {
		this.setState({ showspinner: true });
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getAppointments();
		}
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	showEmployeesList() {
		Actions.AppointmentsEmployeesList({
			title: 'Employees list',
			appointmentsdate: this.state.todaysDate,
			area: 'appointments'
		});
	}

	renderRowAppointments(appointment) {
		if (appointment !== null) {
			return (
				<ListItem style={{ height: 100, backgroundColor: 'white' }} button onPress={() => { Actions.AppointmentsInfo({ appointmentid: appointment._id, title: 'Appointment', appointmentdate: appointment.date }); }}>
					<Body>
						<View style={{ flexDirection: 'row', flex: 1 }}>
							<IconMaterial
								name="access-time" size={20}>
							</IconMaterial>
							<Text>{appointment.hour}:{appointment.minute}</Text>
							<IconMaterial
								style={{
									marginLeft: 20
								}}
								name="local-hospital" size={20}>
							</IconMaterial>
							<Text note>{appointment.employee_alias}</Text>
						</View>
						<View style={{ flexDirection: 'row', flex: 1 }}>
							<IconMaterial name="perm-identity" size={20} />
							<Text note style={{ fontWeight: 'bold', paddingTop: 2.5 }}>{appointment.contact_name}</Text>
						</View>
						<View style={{ flexDirection: 'row', flex: 1 }}>
							<IconMaterial name="phone" size={20} />
							<Text note style={{ fontWeight: 'bold', paddingTop: 2.5 }}>{appointment.telephone}</Text>
						</View>
						<View style={{ flexDirection: 'row', flex: 1 }}>
							<Text note style={{ marginLeft: 30, paddingTop: 2.5, fontStyle: 'italic' }}>{appointment.treatmentslist}</Text>
						</View>
						<MaterialCommunityIcons
							name="chevron-right"
							style={{
								fontSize: 30,
								height: 40,
								top: 20,
								color: '#9b9cb1',
								position: 'absolute',
								right: 10,
							}}
						/>
					</Body>
				</ListItem>
			);
		}
		return (null);
	}

	render() {
		return (
			<Container style={{ paddingTop: 54 }}>
				<View style={{ borderColor: 'steelblue', borderBottomWidth: 2, height: 66 }}>
					<View
						style={{
							paddingTop: 17,
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
								this.onChangeAppointmentDate(date, 'date');
							}}
						/>
						<TouchableOpacity onPress={this.showEmployeesList.bind(this)} style={{ height: 40 }}>
							<View style={{ flexDirection: 'row', flex: 1, padding: 10, borderColor: '#C0C0C0', borderWidth: 1, borderRadius: 6 }}>
								{<Text>{this.state.userSelected.label}</Text>}
								<MaterialCommunityIcons name="arrow-down-drop-circle-outline" size={20} style={{ color: '#CCCCCC' }} />
							</View>
						</TouchableOpacity>
					</View>
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
									fontWeight: 'bold'
								}}
							>{this.state.showspinnertext}</Text>
						</View>
					}
					{this.state.showspinner === false &&
						<View>
							<ListView
								enableEmptySections
								dataSource={this.state.appointmentsList}
								renderRow={this.renderRowAppointments}
							/>
						</View>
					}
					<View style={{ height: 60 }} />
				</Content>
				{this.state.showspinner === false &&
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
						<ActionButton.Item buttonColor="steelblue" title="Create appointment" onPress={() => { this.createNewAppointment(); }}>
							<MaterialCommunityIcons name="plus" size={28} color="white" />
						</ActionButton.Item>
					</ActionButton>
				}
				<ModalSide />
				<FooterMain activeArea="Appointments" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(Appointments);
