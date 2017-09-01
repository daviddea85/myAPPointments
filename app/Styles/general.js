import { Platform, StyleSheet, Dimensions, I18nManager } from 'react-native';

const brandColorPrimary = '#3641a1';

export const styles = {
	topPad: { paddingTop: (Platform.OS === 'ios') ? 64 : 54 },

	tabText: {
		fontSize: 7
	},
	CounterNumber: {
		fontSize: 24,
		alignSelf: 'center'
	},
	CounterLabel: {
		fontSize: 12,
		alignSelf: 'center'
	},

	tableRow: {
		flexDirection: 'row', flex: 1, padding: 0, justifyContent: 'space-around'
	},
	tableHD: {
		borderTopWidth: 0.5, borderTopColor: '#E0E0E0', borderLeftWidth: 0.5, borderLeftColor: '#E0E0E0', borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', padding: 2
	},
	tableHDE: {
		borderTopWidth: 0.5, borderTopColor: '#E0E0E0', borderLeftWidth: 0.5, borderLeftColor: '#E0E0E0', borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0', borderRightWidth: 0.5, borderRightColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', padding: 2
	},
	tableC: {
		borderLeftWidth: 0.5, borderLeftColor: '#E0E0E0', borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', padding: 2
	},
	tableCE: {
		borderLeftWidth: 0.5, borderLeftColor: '#E0E0E0', borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0', borderRightWidth: 0.5, borderRightColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', padding: 2
	},

	itemListIconRight: {
		fontSize: 40,
		height: 40,
		color: '#993a39',
		position: 'absolute',
		top: 10,
		right: 10,
	},

	itemListArrow: {
		fontSize: 30,
		height: 40,
		color: '#9b9cb1',
		position: 'absolute',
		top: 20,
		right: 10,
	},

	saveBtnIcon: {
		fontSize: 25,
		height: 30,
		width: 30,
		color: 'white',
	},

	locationsIcons: {
		fontSize: 30,
		height: 40,
		color: 'black',
		position: 'absolute',
		bottom: 10,
		left: 20,
	},

	tagListSwipteButtons: {
		fontSize: 30,
		height: 40,
		color: 'white',
		position: 'absolute',
		bottom: 25,
		left: 20,
	},

	locationListSwipteButtons: {
		fontSize: 25,
		height: 40,
		color: 'white',
		position: 'absolute',
		bottom: 10,
		left: 20,
	},

	itemListSwipteButtons: {
		fontSize: 30,
		height: 40,
		color: 'white',
		position: 'absolute',
		bottom: 10,
		left: 20,
	},

	bgColorBrandPrimary: {
		backgroundColor: brandColorPrimary,
	},

	overlayBtnTorch: {
		width: 60,
		height: 60,
		position: 'absolute',
		bottom: 10,
		right: 10,
	},

	itemListView: {
		color: '#9b9cb1',
		fontFamily: 'OpenSans-Bold',

	},

	separatorHor: {
		width: Dimensions.get('window').width,
		height: 1,
		backgroundColor: '#b1cad9',
		position: 'absolute',
		bottom: 0,
	},

	avatarContactList: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginTop: 20,
		marginLeft: 10,
	},

	settingAvatartContact: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginTop: 7,
		marginLeft: 10,
	},

	IMStatusAvatartContact: {
		width: 20,
		height: 20,
		borderRadius: 10,
		marginTop: 7,
		marginLeft: 10,
	},

	settingAvatartImage: {
		width: 100,
		height: 100,
		padding: 10,
		borderRadius: 50,
		alignItems: 'center',
		alignSelf: 'center',
	},

	settingUserStrypeView: {
		flexDirection: 'row',
		width: Dimensions.get('window').width,
		backgroundColor: '#314e62',
		padding: 20,
		margin: 10,
	},

	navTitle: {
		color: '#314e62',
		fontFamily: 'OpenSans-Bold',
	},

	navBar: {
		flex: 1,
		backgroundColor: brandColorPrimary,
	},

	mainSubview: {
		textAlign: 'center',
	},

	add_contact_btn_contaner: {
		backgroundColor: 'gray',
		padding: 10,
		marginBottom: 30,
		borderRadius: 25,
		width: 50,
		height: 50,
		alignItems: 'center',
		alignSelf: 'center',
	},

	add_contact_btn: {
		alignItems: 'center',
		alignSelf: 'center',
		width: 30,
		height: 30,
	},

	maximizeViewIM: {
		height: Dimensions.get('window').height - 140,
		color: '#33333a',
		backgroundColor: '#dcdbda',
		position: 'absolute',
		right: 0,
		left: 0,
		bottom: 40,
		flexDirection: 'row',
		paddingLeft: 10,
	},

	mininimViewIMLeft: {
		height: 40,
		color: '#33333a',
		backgroundColor: '#dcdbda',
		position: 'absolute',
		right: 0,
		left: 0,
		bottom: 40,
		flexDirection: 'row',
		paddingLeft: 10,
	},

	mininimViewIMRight: {
		height: 40,
		color: '#33333a',
		backgroundColor: '#dcdbda',
		position: 'absolute',
		right: 0,
		left: 0,
		bottom: 40,
		flexDirection: 'row',
		alignSelf: 'flex-end',
		justifyContent: 'flex-end',
		paddingRight: 10,
	},

	BtnTextIM: {
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		fontFamily: 'OpenSans-Light',
		fontSize: 16,
		color: 'white',
		paddingTop: 10,
	},

	BtnInputIM: {
		height: 40,
		width: 100,
		color: '#33333a',
		backgroundColor: '#314e62',
		position: 'absolute',
		right: 0,
		bottom: 0,
	},

	texInputIM: {
		fontFamily: 'OpenSans-Light',
		height: 40,
		color: '#33333a',
		borderColor: '#9d9db0',
		backgroundColor: '#9d9db0',
		position: 'absolute',
		left: 0,
		right: 100,
		bottom: 0,
	},

	texInput: {
		fontFamily: 'OpenSans-Light',
		height: 40,
		width: 150,
		color: '#33333a',
		borderColor: '#9d9db0',
		backgroundColor: '#9d9db0',
		marginBottom: 20,
	},

	buttonSignUp: {
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		height: 40,
		width: 150,
		backgroundColor: '#314e62',
		marginBottom: 30,
	},

	buttonLogin: {
		fontFamily: 'OpenSans-Light',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		height: 40,
		width: 150,
		backgroundColor: 'black',
		marginBottom: 30,
	},

	buttonLogout: {
		fontFamily: 'OpenSans-Light',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		height: 40,
		width: 150,
		backgroundColor: 'black',
	},

	errorText: {
		fontFamily: 'OpenSans-Light',
		height: 100,
		width: 150,
		color: 'red',
		marginBottom: 20
	},

	iconTabNormal: {
		tintColor: 'black',
		flex: 1,
		width: 30,
		height: 30,
		resizeMode: 'contain',
	},

	iconTabSelected: {
		tintColor: 'white',
		flex: 1,
		width: 30,
		height: 30,
		resizeMode: 'contain',
	},

	floatingButtonImage: {
		width: 30,
		height: 30,
		alignItems: 'center',
		tintColor: '#69cbf8',
	},

	floatingButtonErase: {
		width: 50,
		height: 50,
		borderRadius: 5,
		backgroundColor: '#314e62',
		position: 'absolute',
		top: 250,
		right: 10,
		justifyContent: 'center',
		alignItems: 'center',
		tintColor: '#69cbf8',
	},

	floatingButtonImageColorPicker: {
		width: 30,
		height: 30,
		alignItems: 'center',
	},

	floatingButtonColorPickerStatus: {
		width: 50,
		height: 50,
		borderRadius: 5,
		backgroundColor: '#696969',
		position: 'absolute',
		top: 80,
		left: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},

	floatingButtonShapeSelector: {
		width: 150,
		height: 50,
		borderRadius: 5,
		backgroundColor: '#314e62',
		position: 'absolute',
		top: 80,
		right: 90,
		justifyContent: 'center',
		alignItems: 'center',
	},

	floatingButtonColorPicker: {
		width: 50,
		height: 50,
		borderRadius: 5,
		backgroundColor: '#696969',
		position: 'absolute',
		top: 150,
		left: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},

	floatingButtonPencil: {
		width: 50,
		height: 50,
		borderRadius: 5,
		backgroundColor: '#314e62',
		position: 'absolute',
		top: 150,
		right: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},

	floatingButtonShape: {
		width: 50,
		height: 50,
		borderRadius: 5,
		backgroundColor: '#314e62',
		position: 'absolute',
		top: 80,
		right: 10,
		justifyContent: 'center',
		alignItems: 'center',

	},

	notificationBtn: {
		width: 30,
		height: 30,
		tintColor: 'white',
		marginLeft: 30,
	},

	notificationHeaderText: {
		fontFamily: 'OpenSans-Light',
		color: 'white',
	},

	conversationGridList: {
		flex: 1,
	},

	listView: {
		flex: 1,
		justifyContent: 'center',
	},

	notificationHeader: {
		flex: 1,
		height: 100,
		borderRadius: 5,
		backgroundColor: '#314e62',
		position: 'absolute',
		top: 40,
		right: 3,
		left: 3,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	contactListrow: {
		height: 90,
		width: Dimensions.get('window').width,
		backgroundColor: '#4d5e74',
		flexDirection: 'column',
	},

	colorPicker: {
		flex: 1,
		borderRadius: 5,
		backgroundColor: '#314e62',
		position: 'absolute',
		top: 40,
		right: 40,
		left: 40,
		bottom: 100,
	},

	capture: {
		flex: 0,
		backgroundColor: '#fff',
		borderRadius: 5,
		color: '#000',
		padding: 10,
		margin: 40
	},

	camContainer: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: 'black',
	},

	camPreview: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center'
	},

	navBarTitle: {
		color: '#FFFFFF',
		fontFamily: 'OpenSans-Bold',
	},

	barButtonTextStyle: {
		color: '#FFFFFF'
	},

	barButtonIconStyle: {
		tintColor: 'rgb(255,255,255)'
	},

	deleteUserBtnIcon: {
		fontSize: 25,
		height: 30,
		width: 30,
		color: 'white',
	},
	saveUserBtnIcon: {
		fontSize: 25,
		height: 30,
		width: 30,
		color: 'white',
	},


};
