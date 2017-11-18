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

class TreatmentInformation extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			showspinner: false,
			showspinnertext: 'Loading treatment information, please wait',
			newtreatment: this.props.newtreatment || false,
			treatment: {
				doctype: 'treatmentlist',
				name: '',
				duration: '',
				price: '',
				units: ''
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

	onChangeText(newValue, prop) {
		const intreatment = this.state.treatment;
		intreatment[prop] = newValue;
		this.setState({ treatment: intreatment });
	}

	async saveTreatment(action) {
		this.hideKeyboard();
		if (_.isEmpty(this.state.treatment.name) || _.isEmpty(this.state.treatment.price)) {
			Alert.alert(
				'Validation failed',
				'Treatment cannot be saved without a valid fieds',
				[
					{ text: 'OK', onPress: () => console.log('treatment created/updated') },
				],
				{ cancelable: true }
			);
		} else {
			if (action === 'updated') {
				const updatedTreatment = await DBCompanyConnection.put(this.state.treatment);
				const newrevTreatment= updatedTreatment.rev;
				this.onChangeText(newrevTreatment, '_rev');
			} else {
				const createdTreatment = await DBCompanyConnection.post(this.state.treatment);
				const newrevTreatment = createdTreatment.rev;
				this.onChangeText(newrevTreatment, '_rev');
			}
			this.saveTreatmentAlert(action);
		}
	}

	async saveTreatmentAlert(actionText) {
		if (actionText === 'created') {
			this.setState({ newtreatment: false });
		}
		Alert.alert(
			`Treatment ${actionText}`,
			`The treatment ${this.state.treatment.name} has been ${actionText}`,
			[
				{ text: 'OK', onPress: () => console.log('treatment created/updated') },
			],
			{ cancelable: true }
		);
	}

	async deleteTreatmentConfirmationAlert() {
		Alert.alert(
			'Delete treatment',
			`Are you sure you want to delete the treatment ${this.state.treatment.name}?`,
			[
				{ text: 'Yes', onPress: () => this.deleteTreatment(), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('cancel treatment delete'), style: 'cancel' }
			],
			{ cancelable: true }
		);
	}

	async deleteTreatment() {
		const treatmentDeleted = await DBCompanyConnection.remove(this.state.treatment);
		this.deleteTreatmentAlert();
	}

	async deleteTreatmentAlert() {
		Alert.alert(
			'Treatment deleted',
			'The treatment has been deleted',
			[
				{ text: 'OK', onPress: () => Actions.pop({ refresh: { goBack: true } }) },
			],
			{ cancelable: true }
		);
	}

	connectCompanyDb() {
		const setsyncURL = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(setsyncURL);
		this.companyDBConnected = true;
		this.getProfileGlobalDB();
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	renderButtonsTreatmentManagement() {
		if (this.state.newtreatment === true) {
			return (
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
					<ActionButton.Item buttonColor="#8fbc8f" title="Save treatment" >
						<IconMaterial name="save" size={28} color="white" onPress={() => { this.saveTreatment('created'); }} />
					</ActionButton.Item>
				</ActionButton>
			);
		}
		return (
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
				<ActionButton.Item buttonColor="#8fbc8f" title="Update treatment" onPress={() => { this.saveTreatment('updated'); }} >
					<IconMaterial name="save" size={28} color="white" />
				</ActionButton.Item>
				<ActionButton.Item buttonColor="#f08080" title="Delete treatment" onPress={() => { this.deleteTreatmentConfirmationAlert(); }} >
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
							<TextField label="Name" value={this.state.treatment.name} onChangeText={value => this.onChangeText(value, 'name')} validate />
							<TextField label="Duration (min)" value={this.state.treatment.duration} onChangeText={value => this.onChangeText(value, 'duration')} />
							<TextField label="Price" value={this.state.treatment.price} onChangeText={value => this.onChangeText(value, 'price')} validate />
							<TextField label="Units" value={this.state.treatment.units} onChangeText={value => this.onChangeText(value, 'units')} />
						</View>
					}
					<View style={{ height: 60 }} />
				</Content>
					{this.renderButtonsTreatmentManagement()}
				<FooterMain activeArea="More" />
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
)(TreatmentInformation);
