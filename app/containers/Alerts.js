import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Dimensions, Alert, AsyncStorage, View, Keyboard, Switch, ListView, TextInput, Image } from 'react-native';
import PouchDB from 'pouchdb-react-native';
import { Col, Grid, Row } from 'react-native-easy-grid';
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
	Picker,
	ListItem,
	List,
	Body,
	Spinner,
	Card,
	Header,
	Title,
	CardItem,
	Fab
} from 'native-base';
import _ from 'lodash';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButton from 'react-native-action-button';
import { Actions } from 'react-native-router-flux';
import { FooterMain } from '../containers/common/Footer';
import DatePicker from 'react-native-datepicker';
import ModalPicker from 'react-native-modal-picker';
import moment from 'moment';

const fullWidth = Dimensions.get('window').width; // full width

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;

class pageTwo extends Component {

	constructor(props) {
		super(props);
		this.mainTabs = null;
		const dsAlertsSystem = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const dsAlertsUser = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			showspinner: false,
			alertsSystem: '',
			alertsSystemList: dsAlertsSystem.cloneWithRows([]),
			alertsSystemCount: 0,
			alertsUser: '',
			alertsUserList: dsAlertsUser.cloneWithRows([]),
			alertsUserCount: 0,
		};
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

	componentDidMount() {}

	componentWillReceiveProps(nextProps) {
		if (nextProps.goMenu) {
			Actions.pop({ refresh: { goMenu: true } });
		}
		if (nextProps.goBack) {
			this.connectCompanyDb(true);
		}
	}

	componentDidUpdate() {}

	componentWillUnmount() {}

	async getAlerts() {
		this.setState({ showspinner: true });
		const dsAlertsSystem = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const queryAlertsSystem = { selector: { doctype: 'alert', type: 'system' }, };
		const alertsSystemList = await DBCompanyConnection.find(queryAlertsSystem);
		if (alertsSystemList.docs.length > 0) {
			this.setState({ alertsSystem: alertsSystemList.docs, alertsSystemList: dsAlertsSystem.cloneWithRows(alertsSystemList.docs), alertsSystemCount: alertsSystemList.docs.length });
			this.setState({ showspinner: false });
		} else {
			this.setState({ alertsSystem: this.state.alertsSystem, alertsSystemList: dsAlertsSystem.cloneWithRows([]) });
			this.setState({ showspinner: false });
		}
		const dsAlertsUser = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		const queryAlertsUser = { selector: { doctype: 'alert', type: 'user' }, };
		const alertsUserList = await DBCompanyConnection.find(queryAlertsUser);
		if (alertsUserList.docs.length > 0) {
			this.setState({ alertsUser: alertsUserList.docs, alertsUserList: dsAlertsUser.cloneWithRows(alertsUserList.docs), alertsUserCount: alertsUserList.docs.length });
			this.setState({ showspinner: false });
		} else {
			this.setState({ alertsUser: this.state.alertsUser, alertsUserList: dsAlertsUser.cloneWithRows([]) });
			this.setState({ showspinner: false });
		}
	}

	connectCompanyDb(isConnected) {
		this.setState({ showspinner: true });
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getAlerts();
		}
	}

	renderRowUserAlerts(useralert) {
		if (useralert !== null) {
			return (
				null
			);
		}
		return (null);
	}

	renderRowSystemAlerts(systemalert) {
		if (systemalert !== null) {
			return (
				null
			);
		}
		return (null);
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Tabs initialPage={this.currentTab} ref={(c) => { this._tabs = c; }}>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>User</Text></TabHeading>}>
						<Content style={{ padding: 20 }}>
						{this.state.showspinner && <Spinner /> }
						{this.state.alertsUserCount === 0 && this.state.showspinner === false && <Text>User alerts not found</Text>}
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									justifyContent: 'center'
								}}
							>
								<ListView
									enableEmptySections
									dataSource={this.state.alertsUserList}
									renderRow={this.renderRowUserAlerts}
								/>
							</View>
							<View style={{ height: 60 }} />
						</Content>
					</Tab>
					<Tab heading={<TabHeading><Text style={{ fontSize: 12 }}>System</Text></TabHeading>}>
					<Content style={{ padding: 20 }}>
						{this.state.showspinner && <Spinner /> }
						{this.state.alertsSystemCount === 0 && this.state.showspinner === false && <Text>System alerts not found</Text>}
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									justifyContent: 'center'
								}}
							>
								<ListView
									enableEmptySections
									dataSource={this.state.alertsSystemList}
									renderRow={this.renderRowSystemAlerts}
								/>
							</View>
							<View style={{ height: 60 }} />
						</Content>
					</Tab>
				</Tabs>
				<FooterMain activeArea="Alerts" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(pageTwo);
