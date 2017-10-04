import { Platform, StyleSheet, Dimensions } from 'react-native';

export const styles = {
	topPad: { paddingTop: (Platform.OS === 'ios') ? 64 : 54 },
	errorTextStyle: {
		fontSize: 20,
		alignSelf: 'center',
		color: 'red'
	},
	itemRow: {
		paddingTop: 7,
		paddingBottom: 7
	},
	itemRowSide: {
		paddingTop: 7,
		paddingBottom: 7,
		paddingRight: 20,
		paddingLeft: 20
	},
	itemRowSideBG: {
		paddingTop: 7,
		paddingBottom: 0,
		paddingRight: 20,
		paddingLeft: 20,
		backgroundColor: '#EFEFEF'
	},
	itemRowR: {
		paddingTop: 7,
		paddingBottom: 7,
		justifyContent: 'flex-end'
	},
	itemRowHead1: {
		paddingTop: 7,
		paddingBottom: 7,
		fontSize: 20,
		fontWeight: 'bold'
	},
	itemRowHead2: {
		paddingTop: 7,
		paddingBottom: 7,
		fontSize: 17,
		fontWeight: 'bold'
	},
	itemRowHead1C: {
		paddingTop: 7,
		paddingBottom: 7,
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold'
	},
	itemRowHead2C: {
		paddingTop: 7,
		paddingBottom: 7,
		textAlign: 'center',
		fontSize: 17,
		fontWeight: 'bold'
	},
	itemRowText: {
		paddingTop: 7,
		paddingBottom: 7,
		fontSize: 14
	},
	itemRowTextC: {
		paddingTop: 7,
		paddingBottom: 7,
		textAlign: 'center',
		fontSize: 14
	},
	itemRowNote: {
		paddingTop: 7,
		paddingBottom: 7,
		fontSize: 12,
		color: '#AAAAAA'
	},
	itemRowError: {
		paddingTop: 7,
		paddingBottom: 7,
		fontSize: 14,
		color: 'red'
	},
	itemRowErrorC: {
		paddingTop: 7,
		paddingBottom: 7,
		fontSize: 14,
		color: 'red'
	},
	tabText: {
		fontSize: 8
	},
	imgFull: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').width
	},
	imgBig: {
		width: Dimensions.get('window').width - 40,
		height: Dimensions.get('window').width - 40,
		resizeMode: 'contain'
	},
	imgMed: {
		width: Dimensions.get('window').width - 150,
		height: Dimensions.get('window').width - 150
	},
	imgIcon: {
		width: 120,
		height: 120
	},
	mapcontainer: {
		width: Dimensions.get('window').width - 40,
		height: Dimensions.get('window').width - 40,
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	map: {
		...StyleSheet.absoluteFillObject
	},
	navBar: {
		backgroundColor: '#E67C81',
		borderBottomWidth: 0
	},
	navBarTitle: {
		color: '#FFFFFF'
	},
	barButtonTextStyle: {
		color: '#FFFFFF'
	},
	barButtonIconStyle: {
		tintColor: 'rgb(255,255,255)'
	},
	textView: {
		color: '#FFF',
		paddingTop: 7,
		paddingBottom: 1,
		fontSize: 18,
		shadowColor: '#424B4F',
		shadowOffset: {
			width: 3,
			height: 3
		},
		shadowRadius: 3,
		shadowOpacity: 1.0
	},
	textViewNote: {
		color: '#FFF',
		paddingTop: 4,
		paddingBottom: 1,
		fontSize: 12
	},
	info: {
		width: 0,
		flexGrow: 1,
		marginLeft: 10
	},
	textInput: {
		borderColor: '#cccccc', borderWidth: 0.5, borderRadius: 3, height: 35, paddingHorizontal: 5, flex: 1
	},
	textInputLogin: {
		alignItems: 'center',
		flexDirection: 'row',
		borderColor: '#cccccc',
		borderRadius: 3,
		height: 35,
		paddingHorizontal: 5,
		flex: 1
	},
	textInputIcon: {
		alignItems: 'center',
		flexDirection: 'row',
		borderColor: '#cccccc',
		borderWidth: 0.5,
		borderRadius: 3,
		height: 35,
		paddingHorizontal: 5,
		flex: 1
	},
	textInputNB: {
		height: 35,
		paddingHorizontal: 5,
		flex: 1
	},
	textLabel: {
		color: '#666666',
		paddingBottom: 3,
		paddingLeft: 5,
		fontSize: 14
	},
	textError: {
		color: '#E67C81',
		paddingBottom: 3,
		paddingLeft: 5,
		fontSize: 14
	},
	textSuccess: {
		color: '#4E7D7D',
		paddingBottom: 3,
		paddingLeft: 5,
		fontSize: 14
	},
	colError: {
		color: '#E67C81'
	},
	colSuccess: {
		color: '#4E7D7D'
	},
	backgroundImage: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: null,
		height: null,
		backgroundColor: 'rgba(0,0,0,0)'
	},
	backgroundImageView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: Dimensions.get('window').width,
		height: 120,
		backgroundColor: 'rgba(0,0,0,0)'
	},
	backgroundImageViewInner: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-start',
		width: Dimensions.get('window').width,
		height: 120,
		backgroundColor: 'rgba(0,0,0,0)',
		padding: 10
	},
	iconBoxShopping: {
		fontFamily: 'icomoon',
		// content: "\e981"
	},
	listOneliner: {
		fontSize: 12
	},
	listAddress: {
		color: '#4E7D7D',
		fontSize: 10
	},
	inpt: {
		flex: 1,
		padding: 2,
		height: 25
	},
	inptm: {
		flex: 1,
		padding: 2,
		height: 50
	},
	mainContainer: {
		flex: 1,
		zIndex: 1000
	},
	addshadow: {
		shadowColor: '#424B4F',
		shadowOffset: {
			width: 5,
			height: 5
		},
		shadowRadius: 5,
		shadowOpacity: 1.0
	},
	tabGreyBG: {
		backgroundColor: '#50585c'
	},
	tabGreyBGActive: {
		backgroundColor: '#424B4F'
	},
	radioPlain: {
		color: '#666',
		marginRight: 8
	},
	radioSelected: {
		color: '#E67C81',
		marginRight: 8
	},
	tableInput: {
		height: 28,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 6,
		flex: 1,
		backgroundColor: '#fff',
		color: '#424B4F',
		paddingLeft: 8
	},
	SearchTextField: {
		height: 28, borderColor: '#F1B1B4', borderWidth: 1, borderRadius: 6, flex: 1, backgroundColor: '#fff', color: '#424B4F', paddingLeft: 8
	},
	SearchBox: {
		flexDirection: 'row',
		backgroundColor: '#ED979A',
		padding: 3
	},
	TextAreaSM: {
		height: 56,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 6,
		flex: 1,
		backgroundColor: '#fff',
		color: '#424B4F',
		paddingLeft: 8
	},
	ModalHeader: {
		backgroundColor: '#E67C81',
		borderColor: '#F1B1B4'
	},
	ModalHeaderText: {
		color: '#fff'
	},
	ModalHeaderIcon: {
		color: '#fff'
	},
	SwitchView: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 5,
		marginBottom: 5
	},
	SwitchViewText: {
		justifyContent: 'center'
	},
};
