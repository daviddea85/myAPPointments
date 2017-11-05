import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Dimensions, Alert, AsyncStorage, View, Keyboard, Switch, TouchableOpacity, ListView, Image } from 'react-native';
import PouchDB from 'pouchdb-react-native';
import ImagePicker from 'react-native-image-crop-picker';
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
			employees: [],
		};
		this.renderRow = this.renderRow.bind(this);
		this.companyDatabase = '';
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
		const employeesListObject = {
			key: '',
			value: '',
			label: 'All employees'
		};
		this.employeesList.push(employeesListObject);
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
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 18 : 0 }}>
				<Tabs
					ref={(tabView) => {
						this.mainTabs = tabView;
					}}
				>
					<Tab
						heading={
							<TabHeading>
								<View style={{ flex: 1, flexDirection: 'row', }}>
									<Text
										style={{
											flex: 0.8,
											alignSelf: 'center',
											textAlign: 'center',
											justifyContent: 'center',
											paddingLeft: 50
										}}
									>
										Employees list
									</Text>
									<Button transparent onPress={() => { this.closeEmployeesListModal(); }}>
										<Icon name="ios-close-outline" size={22}/>
									</Button>
								</View>
							</TabHeading>
						}
					>
					<Content>
						<ListView
							dataSource={this.state.employeesList}
							enableEmptySections
							renderRow={this.renderRow.bind(this)}
						/>
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
)(EmployeesList);
