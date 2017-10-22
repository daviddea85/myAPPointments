import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AsyncStorage, Platform, TouchableOpacity, Image, View, Dimensions } from 'react-native';
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
			showspinner: false,
			active: false
		};
		this.userLoggedEmail = '';
	}

	componentWillMount() {
		AsyncStorage.getItem('userLoggedEmail').then((userLoggedEmailValue) => {
			if (userLoggedEmailValue !== null) {
				this.userLoggedEmail = userLoggedEmailValue;
				// this.connectAppPouchDb(true);
				console.log('this.userLoggedEmail');
				console.log(this.userLoggedEmail);
			}
		});
	}

	componentDidMount() { }

	componentWillReceiveProps() {}

	componentDidUpdate() {}

	componentWillUnmount() {}

	usersManagement() {

	}

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
					<TouchableOpacity style={{ marginLeft: 5, marginRight: 5 }} onPress={() => { this.usersManagement(); }}>
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
					<TouchableOpacity style={{ marginLeft: 5, marginRight: 5, marginBottom: 5 }} onPress={() => { Actions.CompanyList({ title: 'Company list', userLogged: this.userLoggedEmail });; }}>
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
