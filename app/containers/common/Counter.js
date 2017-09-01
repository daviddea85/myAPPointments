import React from 'react';
import { Text, View } from 'react-native';
import { Card, Body, CardItem } from 'native-base';
import { styles } from '../../Styles/general';
import { getColour } from '../../lib/Utilities';

const Counter = (inbound) => {

	let useColours = { useBGColour: '#FFFFFF', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
	let useColLT = { useBGColour: '#FFFFFF', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
	let useColGT = { useBGColour: '#FFFFFF', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };

	if (inbound.color && inbound.color !== '-') {
		useColours = getColour(inbound.color);
	}
	if (inbound.colorLT && inbound.colorLT !== '-') {
		useColLT = getColour(inbound.colorLT);
	}
	if (inbound.colorGT && inbound.colorGT !== '-') {
		useColGT = getColour(inbound.colorGT);
	}
	if (inbound.lt && inbound.lt !== '-') {
		if (Number(inbound.value < Number(inbound.lt))) {
			useColours = useColLT;
		}
	}
	if (inbound.gt && inbound.gt !== '-') {
		if (Number(inbound.value) > Number(inbound.gt)) {
			useColours = useColGT;
		}
	}
	return (
		<Card>
			<CardItem style={{ backgroundColor: useColours.useBGColour }}>
				<Body>
					<Text style={{ ...useColours.useCNTColour, ...styles.CounterNumber }}>{inbound.value}</Text>
					<Text style={{ ...useColours.useLBLColour, ...styles.CounterLabel }}>{inbound.label}</Text>
				</Body>
			</CardItem>
		</Card>

	);
};

export { Counter };
