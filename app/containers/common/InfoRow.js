import React from 'react';
import { Text, View } from 'react-native';

const InfoRow = (inbound) => {
	return (
		<View style={{ flexDirection: 'row', marginTop: 5, marginBottom: 3, paddingBottom: 8, borderBottomColor: '#EFEFEF', borderBottomWidth: 0.5 }}>
			<Text style={{ flex: 1, color: '#808080', fontSize: 12, marginLeft: 5 }}>{inbound.label}</Text>
			<Text style={{ flex: 3, fontSize: 13 }}>{inbound.value}</Text>
		</View>

	);
};

export { InfoRow };
