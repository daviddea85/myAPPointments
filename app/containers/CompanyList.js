import React, { Component } from 'react';

import PouchDB from 'pouchdb-react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { ListView, Alert, AsyncStorage, Platform, Dimensions, Text } from 'react-native';
import ActionButton from 'react-native-action-button';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { Body, Container, Content, ListItem, Header, Button, Title, View } from 'native-base';

let DBCompanyConnection = null;
let DBAppConnection = null;

const fullWidth = Dimensions.get('window').width; // full width
const fullHeight = Dimensions.get('window').height; // full height

class GetCompanyList extends Component {

	constructor(props) {
		super(props);
		const dsMembers = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		const dsPendings = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		this.state = {
			dataSource: dsMembers.cloneWithRows([]),
			membersCount: 0,
			members: dsMembers.cloneWithRows([]),
			dataSourcePending: dsPendings.cloneWithRows([]),
			pendingsCount: 0,
			pendings: dsPendings.cloneWithRows([]),
		};
		this.renderRow = this.renderRow.bind(this);
		this.renderRowPendings = this.renderRowPendings.bind(this);
		this.userLoggedEmail = '';
		this.appDatabaseName = 'myappointments';
	}

	componentWillMount() {
		AsyncStorage.getItem('userLoggedEmail').then((userLoggedEmailValue) => {
			if (userLoggedEmailValue !== null) {
				this.userLoggedEmail = userLoggedEmailValue;
				this.connectAppPouchDb(true);
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.goMenu) {
			Actions.pop({ refresh: { goMenu: true } });
		}
		if (nextProps.goBack) {
			AsyncStorage.getItem('companyDatabase').then((companyDatabaseValue) => {
				if (companyDatabaseValue !== null) {
					this.companyDatabase = companyDatabaseValue;
					this.connectAppPouchDb(true);
					// this.syncCompanyPouchDb(true);
				}
			});
		}
	}

	async getCompanyList() {
		this.showMembers();
		this.showPendings();
	}

	// syncCompanyPouchDb(isConnected, member) {
	// 	const setsyncURL = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
	// 	const remoteCompanyDb = new PouchDB(setsyncURL, { ajax: { cache: false } });
	// 	const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
	// 	DBCompanyConnection = new PouchDB(companyLocalDatabase);
	//
	// 	DBCompanyConnection.sync(remoteCompanyDb)
	// 	.on('change', (info) => {
	// 		console.log('change sync ', info);
	// 		// sync in process
	// 	})
	// 	.on('complete', (complete) => {
	// 		console.log('complete sync ', complete);
	// 		this.myappointmentsDBConnected = true;
	// 		if (isConnected && this.myappointmentsDBConnected) {
	// 			this.checkUserAccess(member);
	// 		}
	// 	})
	// 	.on('error', (error) => {
	// 		console.log('error sync ', error);
	// 		Alert.alert(
	// 			'Sync Error',
	// 			error.message,
	// 			[
	// 				{ text: 'Try Again', onPress: () => this.syncCompanyPouchDb(true), style: 'cancel' },
	// 				{ text: 'Cancel', onPress: () => console.log('sync failed and not tried to sync again'), style: 'cancel' }
	// 			],
	// 			{ cancelable: false }
	// 		);
	// 	});
	// }

	connectAppPouchDb(isConnected) {
		const appDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.appDatabaseName.toLowerCase()}`;
		DBAppConnection = new PouchDB(appDatabase);
		this.appDBConnected = true;
		if (isConnected && this.appDBConnected) {
			this.getCompanyList();
		}
	}

	connectCompanyDb(isConnected, member) {
		this.companyDatabase = member.databaseId;
		const companyDatabase = `https://deapps2017:davidenguidanos24380850@deapps2017.cloudant.com/${this.companyDatabase.toLowerCase()}`;
		DBCompanyConnection = new PouchDB(companyDatabase);
		// const companyLocalDatabase = `local_${this.companyDatabase}`.toLowerCase();
		// DBCompanyConnection = new PouchDB(companyLocalDatabase);
		this.companyDBConnected = true;
		if (isConnected && this.companyDBConnected) {
			this.checkUserAccess(member);
			// this.syncCompanyPouchDb(true, member);
		}
	}

	createCompanyForm() {
		Actions.CreateCompany({ companyid: '', title: 'Create company', firebaseUser: this.userLogged });
	}

	joinPendingConfirmation(pending) {
		Alert.alert(
			'Join company',
			`Are you sure you want to be a member of the company ${pending.pendingCompanyName}?`,
			[
				{ text: 'Yes', onPress: () => this.joinPending(pending), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
			],
			{ cancelable: false }
		);
	}

	async joinPending(pending) {
		pending.memberStatus = 'member';
		await DBAppConnection.post(pending);
		this.getCompanyList();
	}

	rejectPendingConfirmation(pending) {
		Alert.alert(
			'Reject invite company',
			`Are you sure you want to reject the invite for the company ${pending.pendingCompanyName}?`,
			[
				{ text: 'Yes', onPress: () => this.rejectPending(pending), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
			],
			{ cancelable: false }
		);
	}

	async rejectPending(pending) {
		pending.memberStatus = 'rejected';
		await DBAppConnection.post(pending);
		this.getCompanyList();
	}

	loadMemberConfirmation(member) {
		Alert.alert(
			'Load company',
			`Are you sure you want to load the company ${member.memberCompanyName}?`,
			[
				{ text: 'Yes', onPress: () => this.loadMember(member), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
			],
			{ cancelable: false }
		);
	}

	async checkUserAccess(member) {
		const query = { selector: { doctype: 'user', email: member.userEmail }, };
		const userInfo = await DBCompanyConnection.find(query);
		if (userInfo.docs.length > 0) {
			AsyncStorage.setItem('userLoggedId', userInfo.docs[0]._id);
			AsyncStorage.setItem('accessType', userInfo.docs[0].accessType);
			AsyncStorage.setItem('companyName', member.memberCompanyName);
			AsyncStorage.setItem('companyDatabase', member.databaseId);
			AsyncStorage.setItem('companyId', member.companyId);
			Actions.Appointments();
		}
	}

	async loadMember(member) {
		console.log('hola member yes');
		console.log(member);
		this.connectCompanyDb(true, member);
	}

	leaveMemberConfirmation(member) {
		Alert.alert(
			'Leave company',
			`Are you sure you want to leave the company ${member.memberCompanyName}?`,
			[
				{ text: 'Yes', onPress: () => this.leaveMember(member), style: 'cancel' },
				{ text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
			],
			{ cancelable: false }
		);
	}

	async leaveMember(member) {
		member.memberStatus = 'pending';
		await DBAppConnection.post(member);
		this.connectAppPouchDb(true);
	}

	async showMembers() {
		// members of
		const queryMember = { selector: { doctype: 'invites', userEmail: this.userLoggedEmail, memberStatus: 'member' }, };
		const companyMember = await DBAppConnection.find(queryMember);
		const dsMembers = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});

		if (companyMember.docs.length > 0) {
			for (let m = 0; m < companyMember.docs.length; m += 1) {
				const queryCompanyInfo = { selector: { doctype: 'company', _id: companyMember.docs[m].companyId }, };
				const companyInfo = await DBAppConnection.find(queryCompanyInfo);
				companyMember.docs[m].memberCompanyName = companyInfo.docs[0].name;
				companyMember.docs[m].userCreated = companyInfo.docs[0].userEmail;
			}
			this.setState({ members: dsMembers.cloneWithRows(companyMember.docs), membersCount: companyMember.docs.length });
		} else {
			this.setState({ members: dsMembers.cloneWithRows([]), membersCount: 0 });
		}
	}

	async showPendings() {
		// pendings
		const queryPendings = { selector: { doctype: 'invites', userEmail: this.userLoggedEmail, memberStatus: 'pending' }, };
		const companyPending = await DBAppConnection.find(queryPendings);
		const dsPendings = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});

		if (companyPending.docs.length > 0) {
			for (let p = 0; p < companyPending.docs.length; p += 1) {
				const queryCompanyInfo = { selector: { doctype: 'company', _id: companyPending.docs[p].companyId }, };
				const companyInfo = await DBAppConnection.find(queryCompanyInfo);
				companyPending.docs[p].pendingCompanyName = companyInfo.docs[0].name;
			}
			this.setState({ pendings: dsPendings.cloneWithRows(companyPending.docs), pendingsCount: companyPending.docs.length });
		} else {
			this.setState({ pendings: dsPendings.cloneWithRows([]), pendingsCount: 0 });
		}
	}

	// checkCompanyEditAccess(member) {
	// 	if (member.userCreated === this.userLoggedEmail) {
	// 		Actions.CreateCompany({ title: member.memberCompanyName, companyid: member.companyId });
	// 	} else {
	// 		Alert.alert(
	// 			'User access',
	// 			`The user ${member.userEmail} does not have access to modify the company information`,
	// 			[
	// 				{ text: 'Ok', onPress: () => this.getCompanyList(), style: 'cancel' },
	// 			],
	// 			{ cancelable: false }
	// 		);
	// 	}
	// }

	renderRow(member) {
		if (member !== null) {
			return (
				<ListItem
					style={{ height: 70, backgroundColor: 'white' }}
					button
					/* onLongPress={() => { this.checkCompanyEditAccess(member); }} */
					iconRight
				>
					<Text
						style={{ color: 'black',
							fontFamily: 'Arial', }}
					>
					{member.memberCompanyName}
					</Text>
					<View
						style={{
							position: 'absolute',
							right: 80
						}}
					>
						<SimpleLineIcons
							name="direction"
							size={24}
							color="green"
							onPress={() => { this.loadMemberConfirmation(member); }}
						/>
						<Text
							style={{
								fontSize: 12,
							}}
						>Load</Text>
					</View>
					<View
						style={{
							position: 'absolute',
							right: 20
						}}
					>
						<SimpleLineIcons
							name="rocket"
							size={24}
							color="red"
							onPress={() => { this.leaveMemberConfirmation(member); }}
						/>
						<Text
							style={{
								fontSize: 12,
								right: 6
							}}
						>Leave</Text>
					</View>
				</ListItem>
			);
		}
		return (null);
	}

	renderRowPendings(pending) {
		if (pending !== null) {
			return (
				<ListItem
					style={{ height: 70, backgroundColor: 'white' }}
				>
					<Text
						style={{ color: 'black',
							fontFamily: 'Arial', }}
					>
						{pending.pendingCompanyName}
					</Text>
					<View
						style={{
							position: 'absolute',
							right: 80
						}}
					>
						<SimpleLineIcons
							name="user-follow"
							size={24}
							color="green"
							onPress={() => { this.joinPendingConfirmation(pending); }}
						/>
						<Text
							style={{
								fontSize: 12,
							}}
						>Join</Text>
					</View>
					<View
						style={{
							position: 'absolute',
							right: 20
						}}
					>
						<SimpleLineIcons
							name="trash"
							size={24}
							color="red"
							onPress={() => { this.rejectPendingConfirmation(pending); }}
						/>
						<Text
							style={{
								fontSize: 12,
								right: 6
							}}
						>Reject</Text>
					</View>
				</ListItem>
			);
		}
		return (null);
	}

	render() {
		return (
			<Container style={{ paddingTop: (Platform.OS === 'ios') ? 64 : 54 }}>
				<View style={{ borderColor: 'steelblue', borderBottomWidth: 2, borderTopWidth: 2, height: 40 }}>
					{this.state.membersCount === 0 && <Text style={{ fontWeight: 'bold', alignSelf: 'center', alignItems: 'center', paddingTop: 8 }}>Member invites not found</Text>}
					{this.state.membersCount !== 0 && <Text style={{ fontWeight: 'bold', alignSelf: 'center', alignItems: 'center', paddingTop: 8 }}>Member of</Text>}
				</View>
				<Content style={{ borderColor: 'steelblue', borderBottomWidth: 0.25, borderWidth: 0.5 }}>
					<ListView
						enableEmptySections
						dataSource={this.state.members}
						renderRow={this.renderRow}
					/>
				</Content>
				<View style={{ borderColor: 'steelblue', borderBottomWidth: 2, borderTopWidth: 2, height: 40 }}>
					{this.state.pendingsCount === 0 && <Text style={{ fontWeight: 'bold', alignSelf: 'center', alignItems: 'center', paddingTop: 8 }}>Pending invites not found</Text>}
					{this.state.pendingsCount !== 0 && <Text style={{ fontWeight: 'bold', alignSelf: 'center', alignItems: 'center', paddingTop: 8 }}>Pending invites</Text>}
				</View>
				<Content style={{ borderColor: 'steelblue', borderBottomWidth: 0.25, borderWidth: 0.5 }}>
					<ListView
						enableEmptySections
						dataSource={this.state.pendings}
						renderRow={this.renderRowPendings}
					/>
				</Content>
				<View style={{ padding: 10, borderColor: 'steelblue', borderTopWidth: 2 }}>
					<Button
						small
						rounded
						style={{
							backgroundColor: '#9DBDF2',
							borderWidth: 1,
							borderColor: 'steelblue',
							alignSelf: 'center',
							width: fullWidth - 200,
							justifyContent: 'center',
						}}
						onPress={this.createCompanyForm.bind(this)}
					>
						<Text>Create company</Text>
					</Button>
				</View>
			</Container>
		);
	}
}

export default connect(
	(state) => {
		return state;
	},
	(dispatch) => {
		return {
			dispatch
		};
	}
)(GetCompanyList);
