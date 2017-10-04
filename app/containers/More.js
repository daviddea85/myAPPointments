import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ListView, View } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';

class More extends Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			dataSource: ds.cloneWithRows([]),
			showspinner: false,
			active: false
		};
	}

	componentWillMount() {}

	componentDidMount() { }

	componentWillReceiveProps() {}

	componentDidUpdate() {}

	componentWillUnmount() { }

	render() {
		return (
			<Container style={{ paddingTop: 64 }}>
				<Content>
					<View style={{ padding: 20 }}>
						<Text>More screen</Text>
					</View>
				</Content>
				<ModalSide />
				<FooterMain activeArea="More" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(More);
