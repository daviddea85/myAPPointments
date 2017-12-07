import React from 'react';
import { View } from 'react-native';
import { Text, Button, Footer, FooterTab, Icon, Badge } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { styles } from '../../Styles/general';

const FooterMain = (inbound) => {
	return (
		<Footer>
			<FooterTab
			style={{

			}}
			>
				<Button active={inbound.activeArea === 'Dashboard'} vertical onPress={() => { Actions.Dashboard(); }}>
					<Icon name="ios-pie-outline" />
					<Text style={styles.tabText}>Overview</Text>
				</Button>
				<Button active={inbound.activeArea === 'Appointments'} vertical onPress={() => { Actions.Appointments(); }}>
					<Icon name="ios-calendar-outline" />
					<Text style={styles.tabText}>Agenda</Text>
				</Button>
				<Button active={inbound.activeArea === 'Contacts'} vertical onPress={() => { Actions.Contacts(); }}>
					<Icon name="ios-people-outline" />
					<Text style={styles.tabText}>Contacts</Text>
				</Button>
				{/* <Button active={inbound.activeArea === 'Alerts'} badge vertical onPress={() => { Actions.Alerts(); }}>
				<Badge danger ><Text>2</Text></Badge>
					<Icon name="ios-megaphone-outline" />
					<Text style={styles.tabText}>Alerts</Text>
				</Button> */}
				<Button active={inbound.activeArea === 'More'} vertical onPress={() => { Actions.More(); }}>
					<Icon name="apps" />
					<Text style={styles.tabText}>More</Text>
				</Button>
			</FooterTab>
		</Footer>
	);
};

export { FooterMain };
