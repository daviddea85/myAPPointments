import { StyleSheet, Dimensions } from 'react-native';

const {height, width} = Dimensions.get('window');

const PADDING = 8;
const BORDER_RADIUS = 3;
const FONT_SIZE = 16;
const HIGHLIGHT_COLOR = 'rgba(0,118,255,0.9)';
const OPTION_CONTAINER_HEIGHT = 400;

export default StyleSheet.create({

	overlayStyle: {
		width: width,
		height: height,
		backgroundColor: 'rgba(0,0,0,0.7)'
	},

	optionContainer: {
		borderRadius: BORDER_RADIUS,
		width: width * 0.8,
		height: OPTION_CONTAINER_HEIGHT,
		backgroundColor: 'rgba(255,255,255,0.8)',
		left: width * 0.1,
		top: (height - OPTION_CONTAINER_HEIGHT) / 2
	},

	cancelContainer: {
		left: width * 0.1,
		top: (height - OPTION_CONTAINER_HEIGHT) / 2 + 10
	},

	selectStyle: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderColor: '#C0C0C0',
		borderWidth: 1,
		padding: 7,
		borderRadius: 6,
		marginBottom: 10
	},

	selectTextStyle: {
		textAlign: 'left',
		color: '#333',
		fontSize: FONT_SIZE
	},

	cancelStyle: {
		borderRadius: BORDER_RADIUS,
		width: width * 0.8,
		backgroundColor: 'rgba(255,255,255,0.8)',
		padding: PADDING
	},

	cancelTextStyle: {
		textAlign: 'center',
		color: '#333',
		fontSize: FONT_SIZE
	},

	optionStyle: {
		padding: PADDING,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc'
	},

	optionTextStyle: {
		textAlign: 'center',
		fontSize: FONT_SIZE,
		color: HIGHLIGHT_COLOR
	},

	sectionStyle: {
		padding: PADDING * 2,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc'
	},

	sectionTextStyle: {
		textAlign: 'center',
		fontSize: FONT_SIZE
	},
	textLabel: {
		color: '#666666',
		paddingBottom: 3,
		paddingLeft: 5,
		fontSize: 14
	}
});
