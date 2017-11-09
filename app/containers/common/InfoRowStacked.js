import React from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';

const InfoRowStacked = (inbound) => {
	let type = 'string';
	let useval = inbound.value;
	if (inbound.type) { type = inbound.type; }
	if (type === 'date') {
		let format = 'ago';
		if (inbound.format) { format = inbound.format; }
		if (format === 'ago') {
			useval = moment(inbound.value).fromNow();
		}
	}
	let bgColor = '#FFFFFF';
	if (inbound.bgColor) { bgColor = inbound.bgColor; }
	return (
		<View style={{ marginTop: 5, marginBottom: 3, paddingBottom: 8, borderBottomColor: '#EFEFEF', backgroundColor: bgColor, borderBottomWidth: 0.5 }}>
				<Text style={{ color: '#999999', fontSize: 13, marginBottom: 3 }}>{inbound.label}</Text>
				<Text style={{ paddingLeft: 10, fontSize: 16 }}>{useval}</Text>
		</View>
	);
};

export { InfoRowStacked };