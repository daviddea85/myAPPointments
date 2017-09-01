// Import libraries for making a component
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { styles } from '../../Styles/general';

// Make a component
const Table = (inbound) => {
	console.log('inbounddata', inbound);
	// defaults: start
	let headerRowStyle = { height: 30 };
	let RowStyle = { height: 30 };
	// defaults: end

	// some dummy data
	let data = {
		header: [
			{ label: 'SKU', style: { flex: 4 } },
			{ label: 'QTY', style: { flex: 2 } },
			{ label: '%', style: { flex: 1 } }
		],
		rows: [
			{
				key: 'M123445-BLK-8',
				columns: [
					{ value: 'M123445-BLK-8' }, { value: '500' }, { value: '0', style: { flex: 1, backgroundColor: '#FFFFFF' }, textStyle: { color: '#000000', fontSize: 12 } }
				],
				data: { id: '1', sku: 'M123445-BLK-8', style: 'M123445', name: 'Drop pocket cardigan', size: '8', colour: 'Cobalt Blue', qty: '500', movement: '0' }
			},
			{
				key: 'M123445-BLK-10',
				columns: [
					{ value: 'M123445-BLK-10' }, { value: '49' }, { value: '118', style: { flex: 1, backgroundColor: '#4C9900' }, textStyle: { color: '#FFFFFF', fontSize: 12 } }
				],
				data: { id: '1', sku: 'M123445-BLK-10', style: 'M123445', name: 'Drop pocket cardigan', size: '10', colour: 'Cobalt Blue', qty: '49', movement: '118' }
			},
			{
				key: 'M123445-BLK-12',
				columns: [
					{ value: 'M123445-BLK-12' }, { value: '134' }, { value: '97', style: { flex: 1, backgroundColor: '#4C9900' }, textStyle: { color: '#FFFFFF', fontSize: 12 } }
				],
				data: { id: '1', sku: 'M123445-BLK-12', style: 'M123445', name: 'Drop pocket cardigan', size: '12', colour: 'Cobalt Blue', qty: '134', movement: '97' }
			},
			{
				key: 'M123445-BLK-14',
				columns: [
					{ value: 'M123445-BLK-14' }, { value: '467' }, { value: '-5', style: { flex: 1, backgroundColor: '#CC0000' }, textStyle: { color: '#FFFFFF', fontSize: 12 } }
				],
				data: { id: '1', sku: 'M123445-BLK-14', style: 'M123445', name: 'Drop pocket cardigan', size: '14', colour: 'Cobalt Blue', qty: '467', movement: '-5' }
			},
		]
	};

	if (inbound.data) { data = inbound.data; }

	if (inbound.headerRowStyle) { headerRowStyle = inbound.headerRowStyle; }

	const useFunc = (row) => {
		if (inbound.onPress) {
			inbound.onPress(row);
		} else {
			console.log('pressNull', row);
		}
	}

	// let useFunc = pressNull;

	const pressRow = (row) => {
		console.log('pressed', row);
	};

	// build header
	const headerColumns = [];
	for (let h = 0; h < data.header.length; h += 1) {
		console.log('[h]', h);
		let colStyle = styles.tableHD;
		if ((h + 1) === data.header.length) { colStyle = styles.tableHDE; }
		headerColumns.push(
			<View key={h} style={{ ...data.header[h].style, ...colStyle }}>
				<Text>{ data.header[h].label }</Text>
			</View>
		);
	}

	const Rows = [];
	for (let r = 0; r < data.rows.length; r += 1) {
		// process columns
		const Cols = [];
		for (let c = 0; c < data.rows[r].columns.length; c += 1) {
			let colSt = data.header[c].style;
			if (data.rows[r].columns[c].style) { colSt = data.rows[r].columns[c].style; }
			let colStyle = styles.tableC;
			if ((c + 1) === data.rows[r].columns.length) { colStyle = styles.tableCE; }
			let colTextStyle = { fontSize: 12 };
			if (data.rows[r].columns[c].textStyle) { colTextStyle = data.rows[r].columns[c].textStyle; }
			Cols.push(
				<View key={c + r} style={{ ...colSt, ...colStyle }}>
					<Text style={colTextStyle}>{data.rows[r].columns[c].value}</Text>
				</View>
			);
		}
		// set row inbound.onPress(data.rows[r]);
		let rowStyle = { height: 30 };
		if (data.rows[r].style) { rowStyle = data.rows[r].style; }
		Rows.push(
			<TouchableOpacity key={r} onPress={() => { useFunc(data.rows[r]); }}>
			<View style={{ ...rowStyle, ...styles.tableRow }}>
				{ Cols }
			</View>
			</TouchableOpacity>
		);
	}

	console.log('Rows', Rows);

	// active={inbound.activeArea === 'Spotted' ? true:false}
	return (
		<View>
			<View style={{ ...headerRowStyle, ...styles.tableRow }}>
				{ headerColumns }
			</View>

			{ Rows }
		</View>
	);
};


// Make the component available to other parts of the app
export { Table };
