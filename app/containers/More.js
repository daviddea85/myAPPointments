import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AsyncStorage, Platform, TouchableOpacity, Image, View, Dimensions, Alert } from 'react-native';
import {
	StyleProvider,
	Container,
	Content,
	Text
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

class More extends Component {

	constructor(props) {
		super(props);
		this.state = {
			showspinner: true,
			active: false
		};
		this.userLoggedId = '';
		this.userLoggedEmail = '';
		this.companyId = '';
		this.companyName = '';
		this.accessType = '';
	}

	componentWillMount() {
		AsyncStorage.getItem('userLoggedId').then((userLoggedIdValue) => {
			if (userLoggedIdValue !== null) {
				this.userLoggedId = userLoggedIdValue;
			}
		});
		AsyncStorage.getItem('userLoggedEmail').then((userLoggedEmailValue) => {
			if (userLoggedEmailValue !== null) {
				this.userLoggedEmail = userLoggedEmailValue;
			}
		});
		AsyncStorage.getItem('companyId').then((companyIdValue) => {
			if (companyIdValue !== null) {
				this.companyId = companyIdValue;
			}
		});
		AsyncStorage.getItem('companyName').then((companyNameValue) => {
			if (companyNameValue !== null) {
				this.companyName = companyNameValue;
			}
		});
		AsyncStorage.getItem('accessType').then((accessTypeValue) => {
			if (accessTypeValue !== null) {
				this.accessType = accessTypeValue;
			}
		});
	}

	componentDidMount() {}

	componentWillReceiveProps() {}

	componentDidUpdate() {}

	componentWillUnmount() {}

	usersManagement() {
		if (this.accessType === 'admin') {
			Actions.UsersManagement({ title: 'Users management' });
		} else {
			Alert.alert(
				'User access',
				`The user ${this.userLoggedEmail} does not have access to the area, please contact your administrator`,
				[
					{ text: 'Ok', onPress: () => console.log('permission access to users management denied'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
	}
	
	rolesManagement() {
		if (this.accessType === 'admin') {
			Actions.RolesManagement({ title: 'Roles management' });
		} else {
			Alert.alert(
				'User access',
				`The user ${this.userLoggedEmail} does not have access to the area, please contact your administrator`,
				[
					{ text: 'Ok', onPress: () => console.log('permission access to role management denied'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
	}

	userProfile() {
		Actions.UserProfileInformation({ title: 'User profile', area: 'profile', userid: this.userLoggedId });
	}

	companyInformation() {
		if (this.accessType === 'admin') {
			Actions.CreateCompany({ title: 'Company information' , companyid: this.companyId });
		} else {
			Alert.alert(
				'User access',
				`The user ${this.userLoggedEmail} does not have access to modify the company information`,
				[
					{ text: 'Ok', onPress: () => console.log('permission to modify company information denied'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
		
	}

	treatmentsManagement() {
		if (this.accessType === 'admin') {
			Actions.TreatmentsManagement({ title: 'Treatments management' });
		} else {
			Alert.alert(
				'User access',
				`The user ${this.userLoggedEmail} does not have access to the area, please contact your administrator`,
				[
					{ text: 'Ok', onPress: () => console.log('permission access to treatments management denied'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
	}

	reportsList() {}

	render() {
		return (
			<Container style={{ paddingTop: 64 }}>
				<Content style={{ backgroundColor: '#CECECE' }}>
					<TouchableOpacity style={{ marginTop: 5, marginLeft: 5, marginRight: 5 }} onPress={() => { this.usersManagement(); }}>
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
							<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>Users management</Text>
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
					<TouchableOpacity style={{ marginLeft: 5, marginRight: 5 }} onPress={() => { this.rolesManagement(); }}>
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
							<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>Roles management</Text>
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
					<TouchableOpacity style={{ marginLeft: 5, marginRight: 5 }} onPress={() => { this.userProfile(); }}>
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
							<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>User profile</Text>
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
					<TouchableOpacity style={{ marginLeft: 5, marginRight: 5 }} onPress={() => { Actions.CompanyList({ title: 'Company list', userLogged: this.userLoggedEmail }); }}>
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
							<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>Switch company</Text>
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
					<TouchableOpacity style={{ marginLeft: 5, marginRight: 5 }} onPress={() => { this.companyInformation(); }}>
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
							<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>Company information</Text>
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
					<TouchableOpacity style={{ marginLeft: 5, marginRight: 5 }} onPress={() => { this.treatmentsManagement(); }}>
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
							<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>Treatments management</Text>
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
					<TouchableOpacity style={{ marginLeft: 5, marginRight: 5, marginBottom: 5 }} onPress={() => { this.reportsList(); }}>
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
							<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>Reports</Text>
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
				</Content>
				<ModalSide />
				<FooterMain activeArea="More" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(More);
