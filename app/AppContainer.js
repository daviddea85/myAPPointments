import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab } from 'native-base';

import {
	Router,
	Scene,
	Actions,
	ActionConst
} from 'react-native-router-flux';

import { modalState, setModalState } from './lib/Utilities';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Dashboard from './containers/Dashboard';
import Appointments from './containers/Appointments';
import AppointmentsInfo from './containers/AppointmentsInfo';
import Contacts from './containers/Contacts';
import ContactInfo from './containers/ContactInfo';
import Alerts from './containers/Alerts';
import More from './containers/More';

import AppointmentsEmployeesList from './containers/AppointmentsEmployeesList';

import LoginForm from './containers/LoginForm';
import CompanyList from './containers/CompanyList';
import CreateCompany from './containers/CreateCompany';

import FirebaseApp from './lib/firebaseData';

class AppContainer extends Component {

	constructor(props) {
		super(props);
		FirebaseApp.init();
		this.state = {
			modalConfigShow: false
		};
	}

	sideModalControl() {
		this.props.setModalState({ prop: 'modalConfigShow', value: true });
	}

	navBarLeftButton() {
		return (
			<IconMaterial
				style={{ position: 'absolute', paddingTop: 3 }}
				name="chevron-left"
				size={32}
				color="black"
				onPress={() => { Actions.pop({ refresh: { goBack: true } }); }}
			/>
		);
	}

	render() {
		return (
			<Router
				renderBackButton={this.navBarLeftButton}
			>
				<Scene key="root">
					<Scene key="Login" component={LoginForm} hideNavBar type={ActionConst.REPLACE} />
					<Scene key="CompanyList" component={CompanyList} hideNavBar={false} title="Company list" />
					<Scene key="CreateCompany" component={CreateCompany} hideNavBar={false} />
					<Scene key="Dashboard" component={Dashboard} hideNavBar={false} title="Dashboard" type={ActionConst.REPLACE} renderBackButton={()=>(null)} rightButtonImage={require('./img/settings.png')} onRight={() => { this.sideModalControl(); }} rightButtonIconStyle={{ width: 25, height: 25 }} />
					<Scene initial key="Appointments" component={Appointments} hideNavBar={false} title="Appointments" type={ActionConst.REPLACE} renderBackButton={()=>(null)} rightButtonImage={require('./img/settings.png')} onRight={() => { this.sideModalControl(); }} rightButtonIconStyle={{ width: 25, height: 25 }} />
					<Scene key="AppointmentsInfo" component={AppointmentsInfo} hideNavBar={false} title="Appointment Info" />
					<Scene key="AppointmentsEmployeesList" component={AppointmentsEmployeesList} hideNavBar title="Employees list" />
					<Scene key="Contacts" component={Contacts} hideNavBar={false} title="Contacts" type={ActionConst.REPLACE} renderBackButton={()=>(null)} rightButtonImage={require('./img/settings.png')} onRight={() => { this.sideModalControl(); }} rightButtonIconStyle={{ width: 25, height: 25 }} />
					<Scene key="ContactInfo" component={ContactInfo} hideNavBar={false} title="Contact info" />
					<Scene key="Alerts" component={Alerts} hideNavBar={false} title="Alerts" type={ActionConst.REPLACE} renderBackButton={()=>(null)} rightButtonImage={require('./img/settings.png')} onRight={() => { this.sideModalControl(); }} rightButtonIconStyle={{ width: 25, height: 25 }} />
					<Scene key="More" component={More} hideNavBar={false} title="More" type={ActionConst.REPLACE} renderBackButton={()=>(null)} rightButtonImage={require('./img/settings.png')} onRight={() => { this.sideModalControl(); }} rightButtonIconStyle={{ width: 25, height: 25 }} />
				</Scene>
			</Router>
		);
	}
}

const mapStateToProps = state => {
	return state;
};

function mapDispatchToProps(dispatch) {
	return {};
}

export default connect(mapStateToProps, { modalState, setModalState })(AppContainer);
