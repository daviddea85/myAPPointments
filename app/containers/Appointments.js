import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, AsyncStorage, ListView, View, TextInput, TouchableOpacity, Dimensions, Keyboard } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab, Tabs, Tab, TabHeading, Badge, Right, Label, Picker, Item, ListItem  } from 'native-base';
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
import ModalPicker from 'react-native-modal-picker';

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
			todaysDate: '',
			// usersList: [],
		};
		this.userSelected = {
			key: '',
			value: '',
			label: 'All employees'
		};
		this.companyDatabase = '';
		this.userLoggedId = '';
	}

	componentWillMount() {
		console.log('componentWillMount');
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
					if (userLoggedIdValue !== null) {
						this.userLoggedId = userLoggedIdValue;
						this.setState({ todaysDate: moment().format('DD-MM-YYYY') });
						this.connectCompanyDb(true);
					}
				});
			} else {
				Actions.login();
			}
		});
	}

	componentDidMount() {
		// if(Platform.OS === 'android'){
			// this.checkPermisions('location');
			// this.checkPermisions('camera');
		// }
		console.log('Permissions');
		console.log(Permissions);


	}

	componentWillReceiveProps(nextProps) {
		console.log('componentWillReceiveProps');
		console.log('nextProps');
		console.log(nextProps);
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
			} else {
				Actions.login();
			}
		});
	}

	componentDidUpdate() {}

	componentWillUnmount() {}

	// checkPermisions(permisionType) {
	//
	// 	console.log('permisionType');
	// 	console.log(permisionType);
	// 	console.log('Permissions');
	// 	console.log(Permissions);
	//
	//
	//
	// 	// Permissions.getPermissionStatus(permisionType)
	// 	// .then(response => {
	// 	// 	//response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
	// 	// 	console.log('Permission  :; ' + permisionType + ' :: ' + response);
	// 	// 	if (response !== 'authorized') {
	// 	// 		this.requestPermission(permisionType);
	// 	// 	}
	// 	// });
	// }
	//
	// requestPermission(permissionType) {
	// 	Permissions.requestPermission(permissionType)
	// 	.then(response => {
	// 			//returns once the user has chosen to 'allow' or to 'not allow' access
	// 			//response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
	// 		console.log('permission for :: ' + permissionType + ' => ' + response);
	// 	});
	// }

	onChangeEmployee(newValue, prop) {
		this.userSelected = newValue;
		this.getAppointments();
	}

	onChangeAppointmentDate(newValue, prop) {
		console.log('changed date');
		this.setState({ todaysDate: newValue });
		this.getAppointments(newValue);
	}

	async getAppointments(dateValue) {
		if (dateValue) {
			this.state.todaysDate = dateValue;
		}
		const dsAppointmentsList = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		const queryEmployee = { selector: { doctype: 'user' }, };
		const employeeInfo = await DBCompanyConnection.find(queryEmployee);
		this.employeesList = [];
		employeesListObject = {
			key: '',
			value: '',
			label: 'All employees'
		};
		this.employeesList.push(employeesListObject);
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
		console.log('this.userSelected');
		console.log(this.userSelected);
		console.log('this.employeesList');
		console.log(this.employeesList);
		if (this.userSelected.value === '') {
			const queryAppointments = { selector: { doctype: 'appointment', date: this.state.todaysDate }, };
			const appointmentsList = await DBCompanyConnection.find(queryAppointments);
			console.log('appointmentList');
			console.log(appointmentsList);
			if (appointmentsList.docs.length > 0) {
				for (let i = 0; i < appointmentsList.docs.length; i += 1) {
					const queryContact = { selector: { doctype: 'contact', _id: appointmentsList.docs[i].contact_id }, };
					const contactInfo = await DBCompanyConnection.find(queryContact);
					appointmentsList.docs[i].contact_name = 'Missing contact name';
					if (contactInfo.docs.length > 0) {
						appointmentsList.docs[i].contact_name = contactInfo.docs[0].givenName +' '+ contactInfo.docs[0].familyName;
						appointmentsList.docs[i].telephone = contactInfo.docs[0].telephone;
					}
					const queryEmployee = { selector: { doctype: 'user', _id: appointmentsList.docs[i].employee_id }, };
					const employeeInfo = await DBCompanyConnection.find(queryEmployee);
					appointmentsList.docs[i].employee_alias = 'Missing employee alias';
					if (contactInfo.docs.length > 0) {
						appointmentsList.docs[i].employee_alias = employeeInfo.docs[0].alias;
						if (employeeInfo.docs[0].alias === '') {
							appointmentsList.docs[i].employee_alias = employeeInfo.docs[0].name;
							if (employeeInfo.docs[0].name === '') {
								appointmentsList.docs[i].employee_alias = employeeInfo.docs[0].email;
							}
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
		} else {
			const queryAppointments = { selector: { doctype: 'appointment', date: this.state.todaysDate, employee_id: this.userSelected.value }, };
			const appointmentsList = await DBCompanyConnection.find(queryAppointments);
			if (appointmentsList.docs.length > 0) {
				for (let i = 0; i < appointmentsList.docs.length; i += 1) {
					const queryContact = { selector: { doctype: 'contact', _id: appointmentsList.docs[i].contact_id }, };
					const contactInfo = await DBCompanyConnection.find(queryContact);
					appointmentsList.docs[i].contact_name = 'Missing contact details';
					if (contactInfo.docs.length > 0) {
						appointmentsList.docs[i].contact_name = contactInfo.docs[0].name;
						appointmentsList.docs[i].telephone = contactInfo.docs[0].telephone;
					}
					const queryEmployee = { selector: { doctype: 'user', _id: appointmentsList.docs[i].employee_id }, };
					const employeeInfo = await DBCompanyConnection.find(queryEmployee);
					appointmentsList.docs[i].employee_alias = 'Missing employee alias';
					if (employeeInfo.docs.length > 0) {
						appointmentsList.docs[i].employee_alias = employeeInfo.docs[0].alias;
					}
					appointmentsList.docs[i].hour = Math.round(appointmentsList.docs[i].hour * 100) / 100;
					if (appointmentsList.docs[i].minute === '0') {
						console.log('appointmentsList.docs[i].minute');
						console.log(appointmentsList.docs[i].minute);
					}
					appointmentsList.docs[i].minute = Math.round(appointmentsList.docs[i].minute * 100) / 100;
				}
				appointmentsList.docs = _.sortBy(appointmentsList.docs, ['hour', 'minute']);
				this.setState({ appointmentsList: dsAppointmentsList.cloneWithRows(appointmentsList.docs), appointmentsListCount: appointmentsList.docs.length });
			} else {
				this.setState({ appointmentsList: dsAppointmentsList.cloneWithRows([]), appointmentsListCount: 0 });
			}
		}
	}

	// async getUsersList() {
	// 	const query = { selector: { doctype: 'user', role: {$in: ['chief','employee'] } }, };
	// 	const usersList = await DBCompanyConnection.find(query);
	// 	console.log('usersList');
	// 	console.log(usersList);
	// 	this.setState({ usersList: usersList.docs });
	// }

	createNewAppointment() {
		// const appointmentid = {
		//   _id: '',
		//   doctype: 'appointment',
		//   date: this.state.todaysDate,
		//   hour: '',
		//   minute: '',
		//   contact_id: '',
		//   employee_id: '',
		//   notes: ''
		// };
		console.log('create new appointment');
		Actions.AppointmentsInfo({ appointmentid: '', title: 'Add appointment', appointmentdate: this.todaysDate  });
	}

	connectCompanyDb(isConnected) {
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getAppointments();
			// this.getUsersList();
		}
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	renderRowAppointments(appointment) {
		if (appointment !== null) {
			return (
				<ListItem style={{ height: 100, backgroundColor: 'white' }} button onPress={() => { Actions.AppointmentsInfo({ appointmentid: appointment._id, title: 'Appointment', appointmentdate: appointment.date }); }}>
					<Body>
						<IconMaterial
						name="access-time"
						size={20}
							style={{
								marginTop: 5
							}}
						>
							<Text> {appointment.hour}:{appointment.minute}
								<Text note> Employee: {appointment.employee_alias}</Text>
							</Text>
						</IconMaterial>
						<IconMaterial name="perm-identity" size={20}>
							<Text note style={{ fontWeight: 'bold' }}> {appointment.contact_name}</Text>
						</IconMaterial>
						<IconMaterial name="phone" size={20}>
							<Text note style={{ fontWeight: 'bold' }}> {appointment.telephone}</Text>
						</IconMaterial>
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

	// <Picker
	//   placeholder="Select employee"
	//   iosHeader="Select employee"
	//   supportedOrientations={['portrait']}
	//   mode="dropdown"
	//   selectedValue={this.userSelected}
	//   onValueChange={(text) => {
	//     this.onChangeEmployee(text, 'userSelected');
	//   }}
	//   value={this.userSelected}
	// >
	//   <Item label="All employees" value="" />
	//   <Item label="Sonia Perez" value="46c2bba07cfc19732103da291f5e5305" />
	//   <Item label="David Enguidanos" value="dc394b4167726410df3ba62d1a21c328" />
	// </Picker>

	// <TextInput
	// 	style={{
	// 		width: 200,
	// 		height: 40,
	// 		borderColor: '#C0C0C0',
	// 		borderWidth: 1,
	// 		borderRadius: 6,
	// 		alignItems: 'center',
	// 		alignSelf: 'center',
	// 	}}
	// 	editable={false}
	// 	placeholder="Select employee"
	// 	value={this.userSelected.label} />

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Tabs
					ref={(tabView) => {
						this.mainTabs = tabView;
					}}
				>
					<Tab
						heading={
							<TabHeading>
								<View
									style={{
										flex: 0.4,
										flexDirection: 'row',
										justifyContent: 'flex-start',
										alignItems: 'center',
										alignSelf: 'center',
										paddingLeft: 8,
										marginBottom: 8,
										paddingTop: 6,
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
												alignSelf: 'center'
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
								</View>
								<View
									style={{
										flex: 0.6,
										flexDirection: 'row',
										justifyContent: 'flex-end',
										alignItems: 'center',
										alignSelf: 'center',
										paddingLeft: 8,
										marginBottom: 8,
										paddingTop: 6,
									}}
								>
									<ModalPicker
										data={this.employeesList}
										initValue="Select employee"
										onChange={(option)=>{ this.onChangeEmployee(option, 'userSelected'); }}>
										<Text
											style={{
												textAlign: 'center',
												paddingTop: 8,
												paddingRight: 12,
												paddingLeft: 12,
												borderColor: '#C0C0C0',
												borderWidth: 1,
												borderRadius: 6,
												height: 40,
											}}
										>
										{this.userSelected.label}
										<MaterialCommunityIcons
											name="chevron-down"
											style={{
												fontSize: 20,
											}}
										/>
										</Text>
									</ModalPicker>
								</View>
							</TabHeading>
						}
					>
						<Content>
							<ListView
								enableEmptySections
								dataSource={this.state.appointmentsList}
								renderRow={this.renderRowAppointments}
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
							<ActionButton.Item buttonColor="steelblue" title="Create appointment" onPress={() => { this.createNewAppointment(); }}>
								<MaterialCommunityIcons name="plus" size={28} color="white" />
							</ActionButton.Item>
						</ActionButton>
						</Tab>
				</Tabs>
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
