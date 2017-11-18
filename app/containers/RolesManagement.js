import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, AsyncStorage, ListView, View, TextInput, TouchableOpacity, Dimensions, Keyboard, Alert } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab, Tabs, Tab, TabHeading, Badge, Right, Label, Picker, Item, ListItem, Spinner  } from 'native-base';
import { Actions } from 'react-native-router-flux';
import ActionButton from 'react-native-action-button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import DatePicker from 'react-native-datepicker';
import PouchDB from 'pouchdb-react-native';
import { FooterMain } from '../containers/common';

PouchDB.plugin(require('pouchdb-find'));
let DBCompanyConnection = null;

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

class RolesManagement extends Component {

	constructor(props) {
		super(props);
		this.floatingBtn = null;
		const dsRolesList = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			rolesListCount: 0,
			rolesList: dsRolesList.cloneWithRows([]),
			showspinner: false,
			showspinnertext: 'Loading roles, please wait'
		};
		this.renderRowRoles = this.renderRowRoles.bind(this);
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

	componentWillReceiveProps(nextProps) {
		if (nextProps.goBack === true) {
			AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
				if (companyDatabaseValue !== null) {
					this.companyDatabase = companyDatabaseValue;
					this.connectCompanyDb(true);
				}
			});
		}
	}

	componentDidUpdate() {}

	componentWillUnmount() {}

	async getRolesList() {
		const dsRolesList = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.queryRoles = { selector: { doctype: 'role' }, };
		const rolesList = await DBCompanyConnection.find(this.queryRoles);
		this.rolesTypesList = [];
		let rolesListObject = {
			key: '0',
			value: 'chief',
			label: 'Chief'
		};
		this.rolesTypesList.push(rolesListObject);
		if (rolesList.docs.length > 0) {
			for (let e = 0; e < rolesList.docs.length; e += 1) {
				rolesListObject = {
					key: '',
					value: '',
					label: ''
				};
				rolesListObject.key = rolesList.docs[e]._rev;
				rolesListObject.value = rolesList.docs[e]._id;
				rolesListObject.label = rolesList.docs[e].title;
				this.rolesTypesList.push(rolesListObject);
			}
		}
		rolesList.docs = _.sortBy(rolesList.docs, ['label']);
		this.setState({ rolesList: dsRolesList.cloneWithRows(this.rolesTypesList), rolesListCount: this.rolesTypesList.length, showspinner: false });
	}

	connectCompanyDb(isConnected) {
		this.setState({ showspinner: true });
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getRolesList();
		}
	}

	createNewRole() {
		Actions.RoleInformation({ title: 'Role information', roleid: '' });
	}

	roleInfo(role) {
		if (role.value === 'chief') {
			Alert.alert(
				'Role error',
				'This is a role by default in the system and cannot be modified',
				[
					{ text: 'OK', onPress: () => console.log('role by default not editable'), style: 'cancel' }
				],
				{ cancelable: true }
			);
		} else {
			Actions.RoleInformation({ title: 'Role information', roleid: role.value });
		}
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	renderRowRoles(role) {
		if (role !== null) {
			return (
				<TouchableOpacity style={{ marginTop: 3, marginLeft: 5, marginRight: 5 }} onPress={() => { this.roleInfo(role); }}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							height: 50,
							borderColor: '#E8E8E8',
							borderRadius: 5,
							borderWidth: 2,
							backgroundColor: 'white'
						}}
					>
						<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>{role.label}</Text>
						<MaterialCommunityIcons
							name="chevron-right"
							style={{
								fontSize: 30,
								height: 40,
								color: '#9b9cb1',
								position: 'absolute',
								top: 7.5,
								right: 10,
								backgroundColor: 'transparent'
							}}
						/>
					</View>
				</TouchableOpacity>
			);
		}
		return (null);
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
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
								dataSource={this.state.rolesList}
								renderRow={this.renderRowRoles}
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
						<ActionButton.Item buttonColor="steelblue" title="Create role" onPress={() => { this.createNewRole(); }}>
							<MaterialCommunityIcons name="plus" size={28} color="white" />
						</ActionButton.Item>
					</ActionButton>
				}
				<FooterMain activeArea="More" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(RolesManagement);
