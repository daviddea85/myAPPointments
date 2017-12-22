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
		this.appointmentAmendedInfo = [];
		
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
					label: '',
					duration: ''
				};
				treatmentsListObject.label = treatmentsInfo.docs[t].name;
				treatmentsListObject.key = treatmentsInfo.docs[t]._rev;
				treatmentsListObject.value = treatmentsInfo.docs[t]._id;
				treatmentsListObject.duration = treatmentsInfo.docs[t].duration;
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
			this.setState({ treatmentsList: ds.cloneWithRows(this.treatmentsList), treatmentslistinfo: treatmentsInfo.docs });
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
					if (this.state.appointment.treatment_id === this.treatmentsList[i].value) {
						const queryappointmentTreatment = { selector: { doctype: 'treatment', appointment_id: this.state.appointment._id, treatment_id: this.treatmentsList[i].value }, };
						this.appointmentTreatmentInfo = await DBCompanyConnection.find(queryappointmentTreatment);
						if (this.appointmentTreatmentInfo.docs.length > 0) {
							const treatmentDeleted = await DBCompanyConnection.remove(this.appointmentTreatmentInfo.docs[0]);
						}
						const queryappointmentsamended = { selector: { doctype: 'appointmentamended', appointment_id: this.state.appointment._id }, };
						const appointmentsamendedinfo = await DBCompanyConnection.find(queryappointmentsamended);
						if (appointmentsamendedinfo.docs.length > 0) {
							const appointmentDeleted = await DBCompanyConnection.remove(this.state.appointment);
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
							this.newappointmentid = appointmentsamendedinfo.docs[0]._id;
							for (let ar = 1; ar < appointmentsamendedinfo.docs.length; ar += 1) {
								this.newhour = parseInt(appointmentsamendedinfo.docs[ar].hour);
								this.newminutes = parseInt(appointmentsamendedinfo.docs[ar].minute);
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
								appointmentsamendedinfo.docs[ar].hour = this.newhour;
								appointmentsamendedinfo.docs[ar].minute = this.newminutes;
								appointmentsamendedinfo.docs[ar].appointment_id = this.newappointmentid;
								const updatedappointmentamended = await DBCompanyConnection.put(appointmentsamendedinfo.docs[ar]);
							}
							this.queryAppointmentTreatments = { selector: { doctype: 'treatment', appointment_id: this.state.appointment._id }, };
							this.treatmentsListInfo = await DBCompanyConnection.find(this.queryAppointmentTreatments);
							if (this.treatmentsListInfo.docs.length > 0) {
								for (let tl = 0; tl < this.treatmentsListInfo.docs.length; tl += 1) {
									this.treatmentsListInfo.docs[tl].appointment_id = this.newappointmentid;
									const updatedtreatmentinfo = await DBCompanyConnection.put(this.treatmentsListInfo.docs[tl]);
								}
							}
							const queryAppointmentImages = { selector: { doctype: 'images', area: 'appointment', owner: this.state.appointment._id }, };
							const appointmentimages = await DBCompanyConnection.find(queryAppointmentImages);
							if (appointmentimages.docs.length > 0) {
								for (let i = 0; i < appointmentimages.docs.length; i += 1) {
									appointmentimages.docs[i].owner = this.newappointmentid;
									const updatedimageinfo = await DBCompanyConnection.put(appointmentimages.docs[i]);
								}
							}
							const inappointment = appointmentsamendedinfo.docs[0];
							_.set(inappointment, '_rev', updatedappointment.rev);
							this.setState({ appointment: inappointment });
						}
					} else {
						const queryappointmentTreatment = { selector: { doctype: 'treatment', appointment_id: this.state.appointment._id, treatment_id: this.treatmentsList[i].value }, };
						this.appointmentTreatmentInfo = await DBCompanyConnection.find(queryappointmentTreatment);
						if (this.appointmentTreatmentInfo.docs.length > 0) {
							const treatmentDeleted = await DBCompanyConnection.remove(this.appointmentTreatmentInfo.docs[0]);
						}
						const queryappointmentamended = { selector: { doctype: 'appointmentamended', appointment_id: this.state.appointment._id, treatment_id: this.appointmentTreatmentInfo.docs[0].treatment_id }, };
						this.appointmentamendedinfo = await DBCompanyConnection.find(queryappointmentamended);
						if (this.appointmentamendedinfo.docs.length > 0) {
							const appointmentAmendedDeleted = await DBCompanyConnection.remove(this.appointmentamendedinfo.docs[0]);
						}
						const index = this.treatmentsSelected.indexOf(this.treatmentsList[i]);
						this.treatmentsSelected.splice(index, 1);
					}
				} else {
					this.treatmentsList[i].selected = true;
					this.treatmentsSelected.push(this.treatmentsList[i]);
					const newTreatment = {};
					newTreatment.doctype = 'treatment';
					newTreatment.appointment_id = this.state.appointment._id;
					newTreatment.contact_id = this.state.appointment.contact_id;
					newTreatment.employee_id = this.state.appointment.employee_id;
					newTreatment.notes = '';
					newTreatment.name = this.treatmentsList[i].label;
					newTreatment.duration = this.treatmentsList[i].duration;
					newTreatment.treatment_id = this.treatmentsList[i].value;
					const savedTreatment = await DBCompanyConnection.post(newTreatment);
					const newid = savedTreatment.id;
					const queryAmendments = { selector: { doctype: 'appointmentamended', appointment_id: this.state.appointmentid }, };
					const appointmentAmendedInfo = await DBCompanyConnection.find(queryAmendments);
					if (appointmentAmendedInfo.docs.length > 0) {
						for (let a = 0; a < appointmentAmendedInfo.docs.length; a += 1) {
							appointmentAmendedInfo.docs[a].hour = Math.round(appointmentAmendedInfo.docs[a].hour * 100) / 100;
							if (parseInt(appointmentAmendedInfo.docs[a].minute < 10)) {
								appointmentAmendedInfo.docs[a].minute = Math.round(appointmentAmendedInfo.docs[a].minute * 100) / 100;
							}
							this.appointmentAmendedInfo.push(appointmentAmendedInfo.docs[a]);
						}
					}
					this.selected_treatments = _.filter(this.treatmentsList, { selected: true });
					if (this.treatmentsSelected.length > 1 && this.selected_treatments.length > 1) {
						if (this.appointmentAmendedInfo.length > 0) {
							this.appointmentAmendedInfo = _.sortBy(this.appointmentAmendedInfo, ['hour', 'minute']).reverse();
							const newappointmentamended = {};
							newappointmentamended.doctype = 'appointmentamended';
							newappointmentamended.date = this.appointmentAmendedInfo[0].date;
							if (!_.isEmpty(newTreatment.duration)) {
								this.newminutes = parseInt(this.appointmentAmendedInfo[0].minute) + parseInt(newTreatment.duration);
								if (this.newminutes >= 60) {
									this.newhour = parseInt(this.appointmentAmendedInfo[0].hour) + 1;
									this.newminutes = this.newminutes - 60;
								} else {
									this.newhour = parseInt(this.appointmentAmendedInfo[0].hour);
								}
							}
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
							newappointmentamended.hour = this.newhour;
							newappointmentamended.minute = this.newminutes;
							newappointmentamended.appointment_id = this.appointmentAmendedInfo[0].appointment_id;
							newappointmentamended.treatment_id = this.treatmentsList[i].value;
							newappointmentamended.treatment_name = newTreatment.name;
							newappointmentamended.treatment_duration = newTreatment.duration;
							newappointmentamended.contact_id = this.state.appointment.contact_id;
							newappointmentamended.employee_id = this.state.appointment.employee_id;
							const savedappointmentamended = await DBCompanyConnection.post(newappointmentamended);
							newappointmentamended._id = savedappointmentamended.id;
							newappointmentamended._rev = savedappointmentamended.rev;
							this.appointmentAmendedInfo.push(newappointmentamended);
						} else {
							const newappointmentamended = {};
							newappointmentamended.doctype = 'appointmentamended';
							newappointmentamended.date = this.state.appointment.date;
							if (!_.isEmpty(newTreatment.duration)) {
								this.newminutes = parseInt(this.state.appointment.minute) + parseInt(newTreatment.duration);
								if (this.newminutes >= 60) {
									this.newhour = parseInt(this.state.appointment.hour) + 1;
									this.newminutes = this.newminutes - 60;
								} else {
									this.newhour = parseInt(this.state.appointment.hour);
								}
							}
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
							newappointmentamended.hour = this.newhour;
							newappointmentamended.minute = this.newminutes;
							newappointmentamended.appointment_id = this.state.appointment._id;
							newappointmentamended.treatment_id = newTreatment.treatment_id;
							newappointmentamended.treatment_name = newTreatment.name;
							newappointmentamended.treatment_duration = newTreatment.duration;
							newappointmentamended.contact_id = this.state.appointment.contact_id;
							newappointmentamended.employee_id = this.state.appointment.employee_id;
							const savedappointmentamended = await DBCompanyConnection.post(newappointmentamended);
							newappointmentamended._id = savedappointmentamended.id;
							newappointmentamended._rev = savedappointmentamended.rev;
							this.appointmentAmendedInfo.push(newappointmentamended);
						}
					} else {
						this.state.appointment.treatment_id = treatments.value;
						this.state.appointment.treatment_duration = treatments.duration;
						const updatedappointment = await DBCompanyConnection.put(this.state.appointment);
						const inappointment = this.state.appointment;
						_.set(inappointment, '_rev', updatedappointment.rev);
						this.setState({ appointment: inappointment });
					}
				}
			}
		}
		this.setState({ treatmentsList: ds.cloneWithRows(this.treatmentsList), treatmentslistinfo: this.state.treatmentslistinfo });
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
			Actions.pop({ refresh: { goBack: true, treatmentsSelected: this.treatmentsSelected, appointment: this.state.appointment } });
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
