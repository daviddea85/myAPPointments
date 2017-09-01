import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from 'native-base';
import { Counter } from './Counter';

const CounterList = (inbound) => {

	let data = [
		{
			row: [
				{ label: 'Plain', value: '100', color: 'yellow' },
				{ label: 'GT', value: '17', lt: '0', gt: '15', color: 'white', colorLT: 'redfade', colorGT: 'greenfade' },
				{ label: 'LT', value: '-23', lt: '0', gt: '15', color: 'white', colorLT: 'redfade', colorGT: 'greenfade' }
			]
		}
	];

	if (inbound.data) {
		data = inbound.data;
	}

	const rows = [];
	for (let r = 0; r < data.length; r += 1) {
		const cols = [];
		for (let c = 0; c < data[r].row.length; c += 1) {
			let uLT = '-'; if (data[r].row[c].lt) { uLT = data[r].row[c].lt; }
			let uGT = '-'; if (data[r].row[c].gt) { uGT = data[r].row[c].gt; }
			let ucolor = '-'; if (data[r].row[c].color) { ucolor = data[r].row[c].color; }
			let ucolorLT = '-'; if (data[r].row[c].colorLT) { ucolorLT = data[r].row[c].colorLT; }
			let ucolorGT = '-'; if (data[r].row[c].colorGT) { ucolorGT = data[r].row[c].colorGT; }

			cols.push(<Counter key={c} label={data[r].row[c].label} value={data[r].row[c].value} lt={uLT} gt={uGT} color={ucolor} colorLT={ucolorLT} colorGT={ucolorGT} />);
		}
		rows.push(
			<View key={r} style={{ flexDirection: 'row' }}>{cols}</View>
		);
	}

	return (
		<View>{rows}</View>
	);
};

export { CounterList };
