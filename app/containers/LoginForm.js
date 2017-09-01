import _ from 'lodash';
import * as firebase from 'firebase';
import React, { Component } from 'react';
import PouchDB from 'pouchdb-react-native';
import { Actions } from 'react-native-router-flux';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { Container, Content, Form, Item, Input, Button, Label, Spinner } from 'native-base';
import { Text, AsyncStorage, Image, Alert } from 'react-native';
import { connect } from 'react-redux';
// import BaseViewScreen from '../BaseViewScreen';

// PouchDB.plugin(require('pouchdb-find'));

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

	renderLoginButton() {
		return (
			<Row style={{ marginTop: 10 }}>
				<Col>
					<Button onPress={this.login.bind(this)} block info>
					<Text>Login</Text>
					</Button>
				</Col>
			</Row>
		);
	}

	renderCreateNewCompanyTextBox() {
		if (this.state.checkedNewCompany) {
			return (
				<Item floatingLabel>
					<Label>Company name</Label>
						<Input
						onChangeText={(text) => {
							this.onChangeText(text, 'companyName');
						}}
						value={this.company.companyName}
						/>
				</Item>
			);
		}
		return (null);
	}

	renderRegisterButton() {
		return (
			<Row style={{ marginTop: 22 }}>
				<Col>
					<Button onPress={this.register.bind(this)} block info>
					<Text>Register</Text>
					</Button>
				</Col>
			</Row>
		);
	}

	render() {
		return (
			// source={require('../img/symphonylogo.png')}
			// <BaseViewScreen>
				<Content style={{ padding: 22 }}>
					<Grid>
						<Row>
							<Image
							style={{ width: 250, height: 75 }}

							/>
						</Row>
						<Row>
							<Col>
								<Form>
									{this.renderCreateNewCompanyTextBox()}
									<Item floatingLabel>
										<Label>Username</Label>
											<Input
											onChangeText={(text) => {
												this.onChangeText(text, 'firebaseEmail');
											}}
											value={this.state.firebaseUser.firebaseEmail}
											/>
									</Item>
									<Item floatingLabel last>
										<Label>Password</Label>
											<Input
												secureTextEntry
												onChangeText={(text) => {
													this.onChangeText(text, 'firebasePassword');
												}}
												value={this.state.firebaseUser.firebasePassword}
											/>
									</Item>
								</Form>
							</Col>
						</Row>
						{this.renderLoginButton()}
						{this.renderRegisterButton()}
					</Grid>
				</Content>
			// </BaseViewScreen>
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
