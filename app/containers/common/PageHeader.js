import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from 'native-base';

const PageHeader = (inbound) => {

	return (
		<View style={{ padding: 5, backgroundColor: '#EFEFEF' }}>
			{inbound.title &&
				<View><Text>{inbound.title}</Text></View>
			}
			<View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, backgroundColor: '#EFEFEF' }}>
				<Icon name="ios-calendar-outline" style={{ fontSize: 15, marginRight: 5 }} />
				<Text style={{ fontSize: 12 }}>7 Days</Text>
				<Icon name="ios-pin-outline" style={{ fontSize: 15, marginRight: 5, marginLeft: 10 }} />
				<Text style={{ fontSize: 12 }}>All Locations</Text>
			</View>
		</View>

	);
};

export { PageHeader };
