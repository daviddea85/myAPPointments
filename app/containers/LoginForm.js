import _ from 'lodash';
import * as firebase from 'firebase';
import React, { Component } from 'react';
import PouchDB from 'pouchdb-react-native';
import { Actions } from 'react-native-router-flux';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { Container, Content, Form, Item, Input, Label, Spinner, Button } from 'native-base';
import { Text, AsyncStorage, Image, Alert, Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import TextFieldLogin from '../containers/common/TextFieldLogin';

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

class LoginForm extends Component {

	constructor(props) {
		super(props);
		this.state = {
			showspinner: false,
			firebaseUser: {
				firebaseEmail: '',
				firebasePassword: '',
			},
			user: {
				doctype: 'user',
				email: '',
				name: '',
				accessType: '',
			},
		};
	}

	componentWillMount() {
		AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
			if (companyDatabaseValue !== null) {
				AsyncStorage.getItem('companyName').then((companyNameValue) => {
					if (companyNameValue !== null) {
						Actions.Dashboard({ companyDatabase: companyDatabaseValue, title: 'Dashboard' });
					}
				});

			}
		});
	}

	onChangeText(newValue, prop) {
		const invalue = this.state.firebaseUser;
		_.set(invalue, prop, newValue);
		this.setState({ firebaseUser: invalue });
	}

	async register() {
		this.setState({ showspinner: true });
		const email = this.state.firebaseUser.firebaseEmail;
		const password = this.state.firebaseUser.firebasePassword;
		try {
			// // create user in firebase
			await firebase.auth().createUserWithEmailAndPassword(email, password);
			const userCreated = await firebase.auth().currentUser;
			Alert.alert(
				'New user added',
				`${userCreated.email} has been added to the system`,
				[
					{ text: 'OK', onPress: () => this.login(), style: 'cancel' },
				],
				{ cancelable: false }
			);
		} catch (error) {
			console.log(error);
			Alert.alert(
				'Sign in',
				'Email already exists, use log in instead',
				[
					{ text: 'OK', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
	}

	async login() {
		try {
			await firebase.auth().signInWithEmailAndPassword(this.state.firebaseUser.firebaseEmail, this.state.firebaseUser.firebasePassword);
			const userSignedIn = await firebase.auth().currentUser;
			AsyncStorage.setItem('userLoggedEmail', userSignedIn.email);
			Actions.company({ title: 'Company list', userLogged: userSignedIn });
		} catch (error) {
			Alert.alert(
				error.code,
				error.message,
				[
					{ text: 'OK', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<Image source={require('../img/loginbackground.png')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center', width: null, height: null }} >
					<View style={{ backgroundColor: 'transparent', alignItems: 'center', }}>
						<TextFieldLogin
							placeholder="Email"
							style={{ marginTop: 50, paddingLeft: 10, paddingRight: 10, backgroundColor: 'white', textAlign: 'center', width: fullWidth - 100, alignSelf: 'center', borderWidth: 2, borderColor: 'steelblue' }}
							label=""
							value={this.state.firebaseUser.firebaseEmail}
							onChangeText={value => this.onChangeText(value, 'firebaseEmail')} />
						<TextFieldLogin
							secureTextEntry
							placeholder="Password"
							style={{ marginTop: 90, paddingLeft: 10, paddingRight: 10, backgroundColor: 'white', textAlign: 'center', width: fullWidth - 100, alignSelf: 'center', borderWidth: 2, borderColor: 'steelblue' }}
							label=""
							value={this.state.firebaseUser.firebasePassword}
							onChangeText={value => this.onChangeText(value, 'firebasePassword')} />
						<Button
							small
							rounded
							style={{
								backgroundColor: 'steelblue',
								borderWidth: 2,
								borderColor: 'steelblue',
								alignSelf: 'center',
								marginTop: 150
							}}
							onPress={this.login.bind(this)}
						>
							<Text>&nbsp;&nbsp;&nbsp;&nbsp;Login&nbsp;&nbsp;&nbsp;&nbsp;</Text>
						</Button>
						<Button
							small
							rounded
							style={{
								backgroundColor: '#9DBDF2',
								borderWidth: 1,
								borderColor: 'steelblue',
								alignSelf: 'center',
								marginTop: 20
							}}
							onPress={this.register.bind(this)}
						>
							<Text>&nbsp;&nbsp;&nbsp;Register&nbsp;&nbsp;&nbsp;</Text>
						</Button>
					</View>
        		</Image>
     		</View>
		);
	}
}

const styles = {
	errorTextStyle: {
		fontSize: 20,
		alignSelf: 'center',
		color: 'red'
	}
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
)(LoginForm);
