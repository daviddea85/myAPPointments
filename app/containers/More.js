import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ListView, View } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, CardItem, Icon, Fab } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { styles } from '../Styles/general';
import { FooterMain } from '../containers/common';
import ModalSide from './common/ModalSide';

class pageTwo extends Component {

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
			<Container>
					<Header>
							<Body>
									<Title>Pag </Title>
							</Body>
					</Header>
					<Content padder>
						<Card>
							<CardItem>
								<Body>
									<Text>
											This is Page One, Press button to goto page two
									</Text>
								</Body>
							</CardItem>
							<CardItem header>
								<Text>GeekyAnts</Text>
              </CardItem>
						</Card>
						<Card>
							<CardItem>
								<Body>
									<Text>
											This is Page One, Press button to goto page two
									</Text>
								</Body>
							</CardItem>
							<CardItem header>
								<Text>GeekyAnts</Text>
              </CardItem>
						</Card>
						<Card>
							<CardItem>
								<Body>
									<Text>
											This is Page One, Press button to goto page two
									</Text>
								</Body>
							</CardItem>
							<CardItem header>
								<Text>GeekyAnts</Text>
              </CardItem>
						</Card>
						<Button><Text>Modal</Text></Button>
					</Content>
					<ModalSide />
					<View>
						<Fab
								active={this.state.active}
								direction="up"
								containerStyle={{ marginBottom: 200 }}
								style={{ backgroundColor: '#5067FF' }}
								position="bottomRight"
								onPress={() => this.setState({ active: !this.state.active })}>
								<Icon name="ios-settings-outline" />
								<Button style={{ backgroundColor: '#34A34F' }}>
										<Icon name="ios-cloud-upload-outline" />
								</Button>
								<Button style={{ backgroundColor: '#3B5998' }}>
										<Icon name="ios-add-outline" />
								</Button>
								<Button style={{ backgroundColor: '#DD5144' }}>
										<Icon name="ios-trash-outline" />
								</Button>
								<Button style={{ backgroundColor: '#FF8C00' }}>
										<Icon name="ios-pulse" />
								</Button>
								<Button style={{ backgroundColor: '#FFD700' }}>
										<Icon name="ios-send-outline" />
								</Button>
						</Fab>
					</View>

					<FooterMain activeArea="More" />
			</Container>
		);
	}
}

const mapStateToProps = (state) => {
	return state;
};

export default connect(mapStateToProps, { })(pageTwo);
