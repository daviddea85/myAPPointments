import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AsyncStorage } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {
		MODAL_STATE
} from '../actions/types';
import {
		MODAL_TREATMENT_LIST_STATE
} from '../actions/types';

export function setModalState({ prop, value }) {
	return (dispatch, getState) => {
		dispatch({
			type: MODAL_STATE,
			payload: { prop, value }
		});
	};
}

export function modalState(prop, value) {
	const newMstate = { prop, value };
	return (dispatch, getState) => {
		dispatch(configSetField({ prop, value }));
	};
	// configSetField({ modal, mstate });
}

export function modalStateFull(modal, show, activeArea, props) {

	let config = props;
	config.modalConfigShow = show;
	config.activeArea = activeArea;
	return (dispatch, getState) => {
		dispatch(configSet(config));
	};
}

export function getColour(col) {
	let ret = { useBGColour: '#FFFFFF', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
	switch (col) {
	case 'bluefade':
		ret = { useBGColour: '#CCE5FF', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
		break;
	case 'blue':
		ret = { useBGColour: '#0000CC', useCNTColour: { color: '#FFFFFF' }, useLBLColour: { color: '#CCE5FF' } };
		break;
	case 'greenfade':
		ret = { useBGColour: '#E5FFCC', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
		break;
	case 'green':
		ret = { useBGColour: '#009900', useCNTColour: { color: '#FFFFFF' }, useLBLColour: { color: '#CCFFCC' } };
		break;
	case 'redfade':
		ret = { useBGColour: '#FFCCCC', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
		break;
	case 'red':
		ret = { useBGColour: '#FF0000', useCNTColour: { color: '#FFFFFF' }, useLBLColour: { color: '#FFCCCC' } };
		break;
	case 'orangefade':
		ret = { useBGColour: '#FFE5CC', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
		break;
	case 'orange':
		ret = { useBGColour: '#FF8000', useCNTColour: { color: '#FFFFFF' }, useLBLColour: { color: '#FFE5CC' } };
		break;
	case 'white':
		ret = { useBGColour: '#FFFFFF', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
		break;
	case 'yellow':
		ret = { useBGColour: '#FFFF00', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
		break;
	case 'grey':
		ret = { useBGColour: '#606060', useCNTColour: { color: '#FFF' }, useLBLColour: { color: '#E0E0E0' } };
		break;
	default:
		ret = { useBGColour: '#FFFFFF', useCNTColour: { color: '#000000' }, useLBLColour: { color: '#666' } };
	}
	return ret;
}
