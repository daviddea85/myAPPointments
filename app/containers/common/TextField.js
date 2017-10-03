import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, TextInput } from 'react-native';
import { Text } from 'native-base';

import MIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { styles } from '../../Styles/general';

class TextField extends Component {
	static propTypes = {
		value: PropTypes.string.isRequired,
		label: PropTypes.string,
		validate: PropTypes.bool,
		height: PropTypes.number,
	}

	static defaultProps = {
		value: '',
		label: 'Label',
		validate: false,
		height: 35
	};
	constructor(props) {
		super(props);
		this.state = {
			TextValue: this.props.value,
			label: this.props.label,
			validate: this.props.validate,
			height: this.props.height
		};
	}

	componentWillMount() {
		this.setState({ TextValue: this.props.value });
		this.setState({ label: this.props.label });
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.value !== this.props.value) {
			this.setState({ TextValue: nextProps.value });
		}
	}

	render() {
		return (
			<View style={{ marginBottom: 10, height: this.state.height + 20, flex: 1, marginRight: 2 }}>
				{this.state.validate && <Text style={this.state.TextValue === '' ? styles.textError : styles.textSuccess}>{this.state.label}</Text>}
				{!this.state.validate && <Text style={styles.textLabel}>{this.state.label}</Text>}
				<View style={{ ...styles.textInputIcon, height: this.state.height }}>
				<TextInput style={{ ...styles.textInputNB, height: this.state.height }} {...this.props} autoCorrect={false} returnKeyType="done" underlineColorAndroid={'transparent'} />
					{this.state.validate && <View>
						<MIcons name={this.state.TextValue === '' ? 'close-circle-outline' : 'check-circle-outline'} size={20} style={this.state.TextValue === '' ? styles.colError : styles.colSuccess} />
					</View>}
				</View>
			</View>
		);
	}
}

const mapStateToProps = state => {
	return state;
};

export default connect(mapStateToProps, { })(TextField);
