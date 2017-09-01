import * as firebase from 'firebase';

class FirebaseApp {
	static init() {
		firebase.initializeApp({
			apiKey: 'AIzaSyCi_PtHpfzIzCLRJHtvrqlPAhnA7zcdqd4',
			authDomain: 'myappointments-c62fa.firebaseapp.com',
			databaseURL: 'https://myappointments-c62fa.firebaseio.com',
			projectId: 'myappointments-c62fa',
			storageBucket: '',
			messagingSenderId: '619504299650'
		});
	}
}

module.exports = FirebaseApp;
