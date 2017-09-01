import {
		MODAL_STATE
} from '../actions/types';

const INITIAL_STATE = {
	modalConfigShow: false,
	modalCheckinShow: false
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
	case MODAL_STATE:
		return { ...state, [action.payload.prop]: action.payload.value };
	default:
		return state;
	}
};
