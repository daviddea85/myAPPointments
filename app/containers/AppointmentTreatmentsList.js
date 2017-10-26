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

class AppointmentTreatmentsList extends Component {

	constructor(props) {
		super(props);
		this.mainTabs = null;
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			contact_id: this.props.contact_id,
			appointment_id: this.props.appointment_id,
			appointment_date: this.props.appointment_date,
			treatmentsList: ds.cloneWithRows([]),
		};
		this.renderRow = this.renderRow.bind(this);
		this.companyDatabase = '';
		this.treatments = '';
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
		// if (nextProps.goMenu) {
		// 	Actions.pop({ refresh: { goMenu: true } });
		// }
		if (nextProps.goBack) {
			this.connectCompanyDb(true);
		}
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	async getTreatmentList() {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		console.log('this.state.contact_id');
		console.log(this.state.contact_id);
		const queryTreatmentsList = { selector: { doctype: 'treatment', contact_id: this.state.contact_id }, };
		const treatmentsList = await DBCompanyConnection.find(queryTreatmentsList);
		console.log('treatmentsList.docs');
		console.log(treatmentsList.docs);
		if (treatmentsList.docs.length > 0) {
			treatmentsList.docs = _.uniqBy(treatmentsList.docs, 'title');
			console.log('treatmentsList.docs');
			console.log(treatmentsList.docs);
			this.treatments = treatmentsList.docs;
			this.setState({ treatmentsList: ds.cloneWithRows(treatmentsList.docs) });
		}
	}

	connectCompanyDb(isConnected, reasonValue) {
		// this.setState({ showspinner: true });
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getTreatmentList();
		}
	}

	selectedRadioButton(treatment) {
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		for (let i = 0; i < this.treatments.length; i += 1) {
			if (this.treatments[i]._id === treatment._id) {
				this.treatments[i].selected = true;
			} else {
				this.treatments[i].selected = false;
			}
		}
		this.setState({ treatmentsList: ds.cloneWithRows(this.treatments) });
	}

	closeTreatmentListModal() {
		this.treatmentTitleSelected = '';
		this.treatmentid = '';
		for (let i = 0; i < this.treatments.length; i += 1) {
			if (this.treatments[i].selected === true) {
				this.treatmentTitleSelected = this.treatments[i].title;
				this.treatmentid = this.treatments[i]._id;
			}
		}
		if (this.treatmentTitleSelected !== '') {
			Actions.AppointmentsInfo({ appointmentid: this.props.appointment_id, title: 'Appointment', appointmentdate: this.props.appointment_date, currentTab: 1, treatmentTitle: this.treatmentTitleSelected, treatmentid: this.treatmentid });
		} else {
			Actions.AppointmentsInfo({ appointmentid: this.props.appointment_id, title: 'Appointment', appointmentdate: this.props.appointment_date, currentTab: 1 });
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
							{treatment.title}
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
										Treatment list
									</Text>
									<Button transparent onPress={() => { this.closeTreatmentListModal(); }}>
										<Icon name="ios-close-outline" size={22}/>
									</Button>
								</View>
							</TabHeading>
						}
					>
					<Content>
						<ListView
							dataSource={this.state.treatmentsList}
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
)(AppointmentTreatmentsList);
