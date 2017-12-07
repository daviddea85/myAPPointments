import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, AsyncStorage, ListView, View, TextInput, TouchableOpacity, Dimensions, Keyboard } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab, Tabs, Tab, TabHeading, Badge, Right, Label, Picker, Item, ListItem, Spinner  } from 'native-base';
import { Actions } from 'react-native-router-flux';
import ActionButton from 'react-native-action-button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import DatePicker from 'react-native-datepicker';
import PouchDB from 'pouchdb-react-native';
import { FooterMain } from '../containers/common';

PouchDB.plugin(require('pouchdb-find'));
let DBCompanyConnection = null;

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

class UsersManagement extends Component {

	constructor(props) {
		super(props);
		this.floatingBtn = null;
		const dsUsersList = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			usersListCount: 0,
			usersList: dsUsersList.cloneWithRows([]),
			showspinner: false,
			showspinnertext: 'Loading users, please wait'
		};
		this.renderRowUsers = this.renderRowUsers.bind(this);
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

	componentWillReceiveProps(nextProps) {
		if (nextProps.goBack === true) {
			AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
				if (companyDatabaseValue !== null) {
					this.companyDatabase = companyDatabaseValue;
					this.connectCompanyDb(true);
				}
			});
		}
	}

	componentDidUpdate() {}

	componentWillUnmount() {}

	async getUsersList() {
		const dsUsersList = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.queryUsers = { selector: { doctype: 'user' }, };
		const usersList = await DBCompanyConnection.find(this.queryUsers);
		if (usersList.docs.length > 0) {
			for (let u = 0; u < usersList.docs.length; u += 1) {
				usersList.docs[u].label = usersList.docs[u].alias;
				if (usersList.docs[u].alias === '') {
					usersList.docs[u].label = usersList.docs[u].name;
					if (usersList.docs[u].name === '') {
						usersList.docs[u].label = usersList.docs[u].email;
					}
				}
			}
			usersList.docs = _.sortBy(usersList.docs, ['label']);
			this.setState({ usersList: dsUsersList.cloneWithRows(usersList.docs), usersListCount: usersList.docs.length});
		} else {
			this.setState({ usersList: dsUsersList.cloneWithRows([]), usersListCount: 0 });
		}
		this.setState({ showspinner: false });
	}

	connectCompanyDb(isConnected) {
		this.setState({ showspinner: true });
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.getUsersList();
		}
	}

	userProfile(user) {
		Actions.UserProfileInformation({ title: 'User information', newuser: false, userid: user._id, area: 'management' });
	}

	createNewUser() {
		Actions.UserProfileInformation({ title: 'User information', newuser: true, userid: '', area: 'management' });
	}

	hideKeyboard() {
		Keyboard.dismiss();
	}

	renderRowUsers(user) {
		if (user !== null) {
			return (
				<TouchableOpacity style={{ marginTop: 3, marginLeft: 5, marginRight: 5 }} onPress={() => { this.userProfile(user); }}>
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
						<Text style={{ marginTop: 12.5, marginLeft: 12, flex: 0.8 }}>{user.label}</Text>
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
			);
		}
		return (null);
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<Content>
					{this.state.showspinner &&
						<View
							style={{
								backgroundColor: 'white',
								justifyContent: 'center',
								marginTop: fullHeight / 4,
							}}
						>
							<Spinner />
							<Text
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									alignSelf: 'center',
									fontWeight: 'bold'
								}}
							>{this.state.showspinnertext}</Text>
						</View>
					}
					{this.state.showspinner === false &&
						<View>
							<ListView
								enableEmptySections
								dataSource={this.state.usersList}
								renderRow={this.renderRowUsers}
							/>
						</View>
					}
					
					<View style={{ height: 60 }} />
				</Content>
				{this.state.showspinner === false &&
					<ActionButton
						size={40}
						buttonColor="#9DBDF2"
						offsetX={10}
						offsetY={10}
						ref={(btn) => {
							this.floatingBtn = btn;
						}}
						onPress={() => { this.hideKeyboard(); }}
						icon={<IconMaterial name="settings" size={28} color="white" />}
					>
						<ActionButton.Item buttonColor="steelblue" title="Create user" onPress={() => { this.createNewUser(); }}>
							<MaterialCommunityIcons name="plus" size={28} color="white" />
						</ActionButton.Item>
					</ActionButton>
				}
				{/* <FooterMain activeArea="More" /> */}
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(UsersManagement);
