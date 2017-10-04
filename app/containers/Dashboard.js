import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AsyncStorage, ListView, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Platform, Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab, Tabs, Tab, TabHeading, Badge, Right  } from 'native-base';
import { Actions } from 'react-native-router-flux';
import MIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
import PouchDB from 'pouchdb-react-native';

PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;

class Dashboard extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			dataSource: ds.cloneWithRows([]),
			showspinner: false,
			active: false,
			searchItem: ''
		};
		this.companyName = '';
		this.companyDatabase = '';
		this.accessType = '';
		this.userLoggedId = '';
	}

	componentWillMount() {}

	componentDidMount() { }

	componentWillReceiveProps() {
		AsyncStorage.getItem('companyName').then((companyNameValue) => {
			if (companyNameValue !== null) {
				this.companyName = companyNameValue;
			}
		});
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				this.companyDatabase = companyDatabaseValue;
			}
		});
		AsyncStorage.getItem('accessType').then((accessTypeValue) => {
			if (accessTypeValue !== null) {
				this.accessType = accessTypeValue;
			}
		});
	}

	componentDidUpdate() {}

	componentWillUnmount() { }

	render() {
		return (
			<Container style={{ paddingTop: 64 }}>
				<Content>
					<View style={{ padding: 20 }}>
						<Text>Dashboard screen</Text>
					</View>
				</Content>
				<ModalSide />
				<FooterMain activeArea="Dashboard" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(Dashboard);
