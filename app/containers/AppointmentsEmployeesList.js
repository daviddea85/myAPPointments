import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Dimensions, Alert, AsyncStorage, View, Keyboard, Switch, TouchableOpacity, ListView, Image } from 'react-native';
import PouchDB from 'pouchdb-react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {
	StyleProvider,
	Container,
	Content,
	Header,
	Left,
	Right,
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
	ListItem,
	Picker,
	Body,
	Spinner,
	Radio
} from 'native-base';
import _ from 'lodash';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButton from 'react-native-action-button';
import { Actions } from 'react-native-router-flux';
import { FooterMain } from '../containers/common/Footer';

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;
const hat = require('hat');

class EmployeesList extends Component {

	constructor(props) {
		super(props);
		this.mainTabs = null;
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			appointmentsdate: this.props.appointmentsdate,
			employeesList: ds.cloneWithRows([]),
			area: this.props.area || '',
			tab: this.props.tab || ''
		};
		this.renderRow = this.renderRow.bind(this);
		this.companyDatabase = '';
		this.employeesSelected = [
			{
				key: 'employee',
				label: 'Employee (time)',
				value: 'employee',
			}
		];
	}

	componentWillMount() {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				this.connectCompanyDb(true);
			}
		});
	}

	componentWillReceiveProps() {}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	async getEmployeesList() {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.employeesList = [];
		const queryEmployee = { selector: { doctype: 'user' }, };
		const employeeInfo = await DBCompanyConnection.find(queryEmployee);
		if (this.state.area === 'appointments') {
			const employeesListObject = {
				key: '',
				value: '',
				label: 'All employees'
			};
			this.employeesList.push(employeesListObject);
		}
		if (employeeInfo.docs.length > 0) {
			for (let e = 0; e < employeeInfo.docs.length; e += 1) {
				const employeesListObject = {
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
			this.setState({ employeesList: ds.cloneWithRows(this.employeesList), employees: employeeInfo.docs });
		}
	}

	connectCompanyDb(isConnected, reasonValue) {
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getEmployeesList();
		}
	}

	selectedRadioButton(employee) {
		if (this.state.area === 'appointments') {
			const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
			for (let i = 0; i < this.employeesList.length; i += 1) {
				if (this.employeesList[i].value === employee.value) {
					this.employeesList[i].selected = true;
				} else {
					this.employeesList[i].selected = false;
				}
			}
			this.setState({ employeesList: ds.cloneWithRows(this.employeesList) });
		} else if (this.state.area === 'dashboard') {
			if (this.state.tab === 'daily') {
				const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
				for (let i = 0; i < this.employeesList.length; i += 1) {
					if (this.employeesList[i].value === employee.value) {
						if (this.employeesList[i].selected === true) {
							this.employeesList[i].selected = false;
							const index = this.employeesSelected.indexOf(this.employeesList[i]);
							this.employeesSelected.splice(index, 1);
						} else {
							if (this.employeesSelected.length < 6) {
								this.employeesList[i].selected = true;
								this.employeesSelected.push(this.employeesList[i]);
							} else {
								Alert.alert(
									'User selected',
									'Only 5 users can be selected at the same time',
									[
										{ text: 'OK', onPress: () => console.log('User selected'), style: 'cancel' }
									],
									{ cancelable: true }
								);
							}
						}
					}
				}
				this.setState({ employeesList: ds.cloneWithRows(this.employeesList) });
			} else {
				const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
				for (let i = 0; i < this.employeesList.length; i += 1) {
					if (this.employeesList[i].value === employee.value) {
						this.employeesList[i].selected = true;
					} else {
						this.employeesList[i].selected = false;
					}
				}
				this.setState({ employeesList: ds.cloneWithRows(this.employeesList) });
			}
		}
	}

	closeEmployeesListModal() {
		this.employeeSelected = '';
		for (let i = 0; i < this.employeesList.length; i += 1) {
			if (this.employeesList[i].selected === true) {
				this.employeeSelected = {
					key: this.employeesList[i].key,
					value: this.employeesList[i].value,
					label: this.employeesList[i].label
				};
			}
		}
		if (this.state.area === 'appointments') {
			if (this.employeeSelected !== '') {
				Actions.Appointments({ title: 'Appointments', userSelected: this.employeeSelected, appointmentsdate: this.state.appointmentsdate });
			} else {
				this.employeeSelected = {
					key: '',
					value: '',
					label: 'All employees'
				};
				Actions.Appointments({ title: 'Appointments', userSelected: this.employeeSelected, appointmentsdate: this.state.appointmentsdate });
			}
		} else if (this.state.area === 'dashboard') {
			if (this.employeeSelected === '') {
				Alert.alert(
					'Employees list',
					'At least one employee needs to be selected',
					[
						{ text: 'OK', onPress: () => console.log('employee not selected'), style: 'cancel' }
					],
					{ cancelable: true }
				);
			} else {
				if (this.state.tab === 'daily') {
					Actions.Dashboard({ title: 'Dashboard', employeesSelected: this.employeesSelected, appointmentsdate: this.state.appointmentsdate, tab: 'daily' });
				} else {
					Actions.Dashboard({ title: 'Dashboard', employeeWeekText: this.employeeSelected.label, employeeWeekSelected: this.employeeSelected, appointmentsdate: this.state.appointmentsdate, tab: 'weekly' });
				}
			}
		}
	}

	renderRow(employee) {
		if (employee != null) {
			return (
				<ListItem onPress={() => this.selectedRadioButton(employee)}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
						}}
					>
						<Radio
							style={{ flex: 0.1, paddingLeft: 12 }}
							size={32}
							selected={employee.selected === true}
							onPress={() => this.selectedRadioButton(employee)}
						/>
						<Text style={{ flex: 0.9 }}>
							{employee.label}
						</Text>
					</View>
				</ListItem>
			);
		};
		return (null);
	}

	render() {
		return (
			<Container>
				<Header>
					<Left>
					<Button transparent onPress={() => { this.closeEmployeesListModal(); }}>
						<MaterialCommunityIcons size={32} name='chevron-left' />
					</Button>
					</Left>
					<Body style={{ backgroundColor: 'transparent' }}>
						<Title style={{ fontWeight: 'normal' }}>Employees list</Title>
					</Body>
					<Right />
				</Header>
				<Content>
					<ListView
						dataSource={this.state.employeesList}
						enableEmptySections
						renderRow={this.renderRow.bind(this)}
					/>
				</Content>
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
)(EmployeesList);
