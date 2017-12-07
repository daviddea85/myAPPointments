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

class TreatmentsList extends Component {

	constructor(props) {
		super(props);
		this.mainTabs = null;
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			appointment: this.props.appointment,
			treatmentslistinfo: this.props.treatmentslistinfo,
			treatmentsList: ds.cloneWithRows([]),
		};
		this.renderRow = this.renderRow.bind(this);
		this.companyDatabase = '';
		this.treatmentsSelected = [];
		
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

	async getTreatmentsList() {
		this.treatmentsList = [];
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const queryTreatments = { selector: { doctype: 'treatmentlist' }, };
		const treatmentsInfo = await DBCompanyConnection.find(queryTreatments);
		if (treatmentsInfo.docs.length > 0) {
			for (let t = 0; t < treatmentsInfo.docs.length; t += 1) {
				const treatmentsListObject = {
					key: '',
					value: '',
					label: ''
				};
				treatmentsListObject.label = treatmentsInfo.docs[t].name;
				treatmentsListObject.key = treatmentsInfo.docs[t]._rev;
				treatmentsListObject.value = treatmentsInfo.docs[t]._id;
				if (!_.isEmpty(this.state.treatmentslistinfo)) {
					const treatment = _.find(this.state.treatmentslistinfo, { treatment_id: treatmentsInfo.docs[t]._id });
					if (!_.isEmpty(treatment)) {
						treatmentsListObject.selected = true;
					}
				}
				const previoustreatment = _.find(this.state.treatmentslistinfo, { value: treatmentsInfo.docs[t]._id });
				if (!_.isEmpty(previoustreatment)) {
					treatmentsListObject.selected = true;
				}
				this.treatmentsList.push(treatmentsListObject);
			}
			this.treatmentsList = _.sortBy(this.treatmentsList, ['label']);
			this.setState({ treatmentsList: ds.cloneWithRows(this.treatmentsList), treatments: treatmentsInfo.docs });
		}
	}

	connectCompanyDb(isConnected, reasonValue) {
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getTreatmentsList();
		}
	}

	async selectedRadioButton(treatments) {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		for (let i = 0; i < this.treatmentsList.length; i += 1) {
			if (this.treatmentsList[i].value === treatments.value) {
				if (this.treatmentsList[i].selected === true) {
					this.treatmentsList[i].selected = false;
					const index = this.treatmentsSelected.indexOf(this.treatmentsList[i]);
					this.treatmentsSelected.splice(index, 1);
					const queryTreatmentsAppointment = { selector: { doctype: 'treatment', treatment_id: this.treatmentsList[i].value, appointment_id: this.state.appointment._id }, };
					const treatmentInfo = await DBCompanyConnection.find(queryTreatmentsAppointment);
					if (treatmentInfo.docs.length > 0) {
						const treatmentDeleted = await DBCompanyConnection.remove(treatmentInfo.docs[0]);
					}
				} else {
					this.treatmentsList[i].selected = true;
					this.treatmentsSelected.push(this.treatmentsList[i]);
					const newTreatment = {};
					newTreatment.doctype = 'treatment';
					newTreatment.appointment_id = this.state.appointment._id;
					newTreatment.contact_id = this.state.contact_id;
					newTreatment.employee_id = this.state.employee_id;
					newTreatment.notes = '';
					newTreatment.name = this.treatmentsList[i].label;
					newTreatment.treatment_id = this.treatmentsList[i].value;
					const savedTreatment = await DBCompanyConnection.post(newTreatment);
				}
			}
		}
		this.setState({ treatmentsList: ds.cloneWithRows(this.treatmentsList) });
	}

	closeTreatmentsListModal() {
		this.treatmentsSelected = [];
		const treatments = _.filter(this.treatmentsList, { selected: true });
		if (treatments.length > 0) {
			for (let t = 0; t < treatments.length; t += 1) {
				this.treatmentsSelected.push(treatments[t]);
			}
		}
		if (this.treatmentsSelected.length > 0) {
			Actions.pop({ refresh: { goBack: true, treatmentsSelected: this.treatmentsSelected } });
		} else {
			Alert.alert(
				'Treatment error',
				'Please select one treatment for the appointment',
				[
					{ text: 'OK', onPress: () => console.log('treatment not selected'), style: 'cancel' }
				],
				{ cancelable: true }
			);
		}
	}

	renderRow(treatment) {
		if (treatment != null) {
			return (
				<ListItem onPress={() => this.selectedRadioButton(treatment)}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
						}}
					>
						<Radio
							style={{ flex: 0.1, paddingLeft: 12 }}
							size={32}
							selected={treatment.selected === true}
							onPress={() => this.selectedRadioButton(treatment)}
						/>
						<Text style={{ flex: 0.9 }}>
							{treatment.label}
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
					<Button transparent onPress={() => { this.closeTreatmentsListModal(); }}>
						<MaterialCommunityIcons size={32} name='chevron-left' />
					</Button>
					</Left>
					<Body style={{ backgroundColor: 'transparent' }}>
						<Title style={{ fontWeight: 'normal' }}>Treatments list</Title>
					</Body>
					<Right />
				</Header>
				<Content>
					<ListView
						dataSource={this.state.treatmentsList}
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
)(TreatmentsList);
