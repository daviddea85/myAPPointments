import React, { Component } from 'react';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import PouchDB from 'pouchdb-react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { ListView, Alert, AsyncStorage, Keyboard, View, Platform, ScrollView, Switch, Dimensions } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleProvider, Body, Container, Content, Header, Item, Input, Label, Title, Button, Text, Spinner } from 'native-base';
import { FooterMain } from '../containers/common';
import TextField from '../containers/common/TextField';
import ModalPicker from './common/ModalPicker';
import styles from './common/ModalPickerStyle';
import { InfoRowStacked } from './common/InfoRowStacked';

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;
let DBAppointmentsConnection = null;

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

const hat = require('hat');

class RoleInformation extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			showspinner: false,
			showspinnertext: 'Loading role info, please wait',
			roleid: this.props.roleid || false,
			role: {
				doctype: 'role',
				title: '',
			}
		};
		this.companyDatabase = '';
		this.companyId = '';
	}

	componentWillMount() {
		AsyncStorage.getItem('companyId').then((companyIdValue) => {
			if (companyIdValue !== null) {
				this.companyId = companyIdValue;
			}
		});
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
				this.connectCompanyDb(true);
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

	async getRoleInfo() {
		if (!_.isEmpty(this.state.roleid)) {
			const queryRole = { selector: { doctype: 'role', _id: this.state.roleid }, };
			const roleinfo = await DBCompanyConnection.find(queryRole);
			if (roleinfo.docs.length > 0) {
				this.setState({ role: roleinfo.docs[0], showspinner: false });
			}
		} else {
			this.setState({ role: this.state.role, showspinner: false });
		}
	}

	onChangeText(newValue, prop) {
		const inrole = this.state.role;
		inrole[prop] = newValue;
		this.setState({ role: inrole });
	}

	async saveRole(action) {
		this.hideKeyboard();
		if (_.isEmpty(this.state.role.title)) {
			Alert.alert(
				'Validation failed',
				'Role cannot be saved without a valid name',
				[
					{ text: 'OK', onPress: () => console.log('role created/updated') },
				],
				{ cancelable: true }
			);
		} else {
			if (action === 'updated') {
				const updatedRole = await DBCompanyConnection.put(this.state.role);
				const newrevRole = updatedRole.rev;
				this.onChangeText(newrevRole, '_rev');
			} else {
				const createdRole = await DBCompanyConnection.post(this.state.role);
				const newrevRole = createdRole.rev;
				this.onChangeText(newrevRole, '_rev');
			}
			this.saveRoleAlert(action);
		}
	}

	async saveRoleAlert(actionText) {
		if (actionText === 'created') {
			this.setState({ newrole: false });
		}
		Alert.alert(
			`Role ${actionText}`,
			`The role ${this.state.role.title} has been ${actionText}`,
			[
				{ text: 'OK', onPress: () => console.log('role created/updated') },
			],
			{ cancelable: true }
		);
	}

	async deleteRoleConfirmationAlert() {
		Alert.alert(
			'Delete role',
			`Are you sure you want to delete the role ${this.state.role.title}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteRole(), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel role delete'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async deleteRole() {
		const roleDeleted = await DBCompanyConnection.remove(this.state.role);
		this.deleteRoleAlert();
	}

	async deleteRoleAlert() {
		Alert.alert(
			'Role deleted',
			'The role has been deleted',
			[
				{ text: 'OK', onPress: () => Actions.pop({ refresh: { goBack: true } }) },
			],
			{ cancelable: true }
		);
	}

	connectCompanyDb() {
		this.setState({ showspinner: true });
		const setsyncURL = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(setsyncURL);
		this.companyDBConnected = true;
		this.getRoleInfo();
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	renderButtonsRoleManagement() {
		if (this.state.newrole === true) {
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
					<ActionButton.Item buttonColor="#8fbc8f" title="Save role" >
						<IconMaterial name="save" size={28} color="white" onPress={() => { this.saveRole('created'); }} />
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
				<ActionButton.Item buttonColor="#8fbc8f" title="Update role" onPress={() => { this.saveRole('updated'); }} >
					<IconMaterial name="save" size={28} color="white" />
				</ActionButton.Item>
				<ActionButton.Item buttonColor="#f08080" title="Delete role" onPress={() => { this.deleteRoleConfirmationAlert(); }} >
					<IconMaterial name="delete" size={28} color="white" />
				</ActionButton.Item>
			</ActionButton>
		);
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
						<View style={{ padding: 20 }}>
							<TextField label="Name" value={this.state.role.title} onChangeText={value => this.onChangeText(value, 'title')} validate />
						</View>
					}
					<View style={{ height: 40 }} />
				</Content>
					{this.renderButtonsRoleManagement()}
				{/* <FooterMain activeArea="More" /> */}
			</Container>
		);
	}
}

export default connect(
	(state) => {
		return state;
	},
	(dispatch) => {
		return {
			dispatch
		};
	}
)(RoleInformation);
