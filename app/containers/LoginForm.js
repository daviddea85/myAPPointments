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

// import BaseViewScreen from '../BaseViewScreen';

// PouchDB.plugin(require('pouchdb-find'));

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

	// <Button onPress={this.login.bind(this)} block info>
	// <Text>Login</Text>
	// </Button>

	// <Button
	// 	small
	// 	rounded
	// 	style={{
	// 		backgroundColor: 'steelblue',
	// 		colour: 'green',
	// 		alignSelf: 'center',
	// 	}}
	// 	onPress={() => this.login()}
	// >
	// 	<Text>LOGIN</Text>
	// </Button>

	renderLoginButton() {
		return (
			<Row style={{ marginTop: 30 }}>
				<Col>
					<Button
						small
						rounded
						style={{
							backgroundColor: '#9DBDF2',
							alignSelf: 'center'
						}}
						onPress={this.login.bind(this)}
					>
						<Text>LOGIN</Text>
					</Button>
				</Col>
			</Row>
		);
	}

	// <Button onPress={this.register.bind(this)} block info>
	// <Text>Register old</Text>
	// </Button>


	renderRegisterButton() {
		return (
			<Row style={{ marginTop: 20 }}>
				<Col>
					<Button
						small
						rounded
						style={{
							backgroundColor: '#9DBDF2',
							alignSelf: 'center'
						}}
						onPress={this.register.bind(this)}
					>
						<Text>REGISTER</Text>
					</Button>
				</Col>
			</Row>
		);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
        <Image source={require('../img/loginbackground.png')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center', width: null, height: null }} >
          <View style={{ backgroundColor: 'transparent', alignItems: 'center', }}>
						<TextFieldLogin
							placeholder="Email"
							style={{ marginTop: 80, paddingLeft: 10, paddingRight: 10, backgroundColor: 'white', textAlign: 'center', width: fullWidth - 100, alignSelf: 'center', borderWidth: 2, borderColor: 'steelblue' }}
							label=""
							value={this.state.firebaseUser.firebaseEmail}
							onChangeText={value => this.onChangeText(value, 'firebaseEmail')} />
						<TextFieldLogin
							secureTextEntry
							placeholder="Password"
							style={{ marginTop: 150, paddingLeft: 10, paddingRight: 10, backgroundColor: 'white', textAlign: 'center', width: fullWidth - 100, alignSelf: 'center', borderWidth: 2, borderColor: 'steelblue' }}
							label=""
							value={this.state.firebaseUser.firebasePassword}
							onChangeText={value => this.onChangeText(value, 'firebasePassword')} />
						<Button
							small
							rounded
							style={{
								backgroundColor: '#9DBDF2',
								borderWidth: 2,
								borderColor: 'steelblue',
								alignSelf: 'center',
								marginTop: 120
							}}
							onPress={this.login.bind(this)}
						>
							<Text>LOGIN</Text>
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
							<Text>REGISTER</Text>
						</Button>
					</View>
        </Image>
      </View>

			// <Image
			// 	style={{
			// 		flex: 1,
			// 		width: null,
			// 		height: null,
			// 		resizeMode: 'cover',
			// 	}}
			// 	source={require('../img/loginbackground.png')}
			// >
			//
			// 		<TextField placeholder="Username 1" style={{ paddingLeft: 10, paddingRight: 10, marginTop: fullHeight / 3 ,backgroundColor: 'white', width: 200, alignSelf: 'center', borderWidth: 2, borderColor: 'steelblue' }} label="" value={this.state.firebaseUser.firebaseEmail} onChangeText={value => this.onChangeText(value, 'firebaseEmail')} />
			// 		<TextField placeholder="Username" style={{ paddingLeft: 10, paddingRight: 10, backgroundColor: 'white', width: 200, alignSelf: 'center', borderWidth: 2, borderColor: 'steelblue' }} label="" value={this.state.firebaseUser.firebaseEmail} onChangeText={value => this.onChangeText(value, 'firebaseEmail')} />
			//
			//
			// 	</Image>
			// source={require('../img/symphonylogo.png')}
			// <BaseViewScreen>
// 				<Content style={{ padding: 22 }}>
// 				<Image
//      style={{ width: fullWidth, height: fullHeight }}
//      source={require('../img/loginbackground.png')}
// />
// 					<Grid>
// 						<Row>
// 							<Image
// 							style={{ width: 250, height: 75 }}
//
// 							/>
// 						</Row>
// 						<Row>
// 							<Col>
// 								<Form>
// 									<Item stackedLabel>
// 										<Label>Username</Label>
// 											<Input
// 											onChangeText={(text) => {
// 												this.onChangeText(text, 'firebaseEmail');
// 											}}
// 											value={this.state.firebaseUser.firebaseEmail}
// 											/>
// 									</Item>
// 									<Item stackedLabel>
// 										<Label>Password</Label>
// 											<Input
// 												secureTextEntry
// 												onChangeText={(text) => {
// 													this.onChangeText(text, 'firebasePassword');
// 												}}
// 												value={this.state.firebaseUser.firebasePassword}
// 											/>
// 									</Item>
// 								</Form>
// 							</Col>
// 						</Row>
// 						{this.renderLoginButton()}
// 						{this.renderRegisterButton()}
// 					</Grid>
// 				</Content>
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
