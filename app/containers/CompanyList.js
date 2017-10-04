import React, { Component } from 'react';

import PouchDB from 'pouchdb-react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { ListView, Alert, AsyncStorage } from 'react-native';
import ActionButton from 'react-native-action-button';
// import Swipeout  from 'react-native-swipe-out';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { Body, Container, Content, ListItem, Header, Text, Button, Title, View } from 'native-base';

// import Style from '../styles/styles';

// PouchDB.plugin(require('pouchdb-find'));

let DBCompanyConnection = null;
let DBAppConnection = null;

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
	// 		this.xelacoreDBConnected = true;
	// 		if (isConnected && this.xelacoreDBConnected) {
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
		Actions.createCompany({ companyid: '', title: 'Create company', firebaseUser: this.userLogged });
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
			Actions.Appointments();
		}
	}

	async loadMember(member) {
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

	checkCompanyEditAccess(member) {
		if (member.userCreated === this.userLoggedEmail) {
			AsyncStorage.setItem('companyDatabase', '');
			Actions.createCompany({ title: member.memberCompanyName, companyid: member.companyId });
		} else {
			Alert.alert(
				'User access',
				`The user ${member.userEmail} does not have access to modify the company information`,
				[
					{ text: 'Ok', onPress: () => this.getCompanyList(), style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
	}

	renderRow(member) {
		if (member !== null) {
			return (
				<ListItem
					style={{ height: 70, backgroundColor: 'white' }}
					button
					onPress={() => { this.checkCompanyEditAccess(member); }}
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
							right: 60
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
							right: 10
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
							right: 60
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
							right: 10
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
			<Container>
				<Header style={{ backgroundColor: '#3641a1' }}>
					<Body>
					<Title style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
					Select a company
					</Title>
					</Body>
				</Header>
				<Content>
				{this.state.membersCount === 0 && <Text style={{ paddingLeft: 5, fontWeight: 'bold' }}>Member invites not found</Text>}
				{this.state.membersCount !== 0 && <Text style={{ paddingLeft: 5, fontWeight: 'bold' }}>Member Of</Text>}
					<ListView
						enableEmptySections
						dataSource={this.state.members}
						renderRow={this.renderRow}
					/>
				</Content>
				<Content>
				{this.state.pendingsCount === 0 && <Text style={{ paddingLeft: 5, fontWeight: 'bold' }}>Pending invites not found</Text>}
				{this.state.pendingsCount !== 0 && <Text style={{ paddingLeft: 5, fontWeight: 'bold' }}>Pending invites</Text>}
					<ListView
						enableEmptySections
						dataSource={this.state.pendings}
						renderRow={this.renderRowPendings}
					/>
				</Content>
				<Button onPress={this.createCompanyForm.bind(this)} block info>
				<Text>Create new Company</Text>
				</Button>
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