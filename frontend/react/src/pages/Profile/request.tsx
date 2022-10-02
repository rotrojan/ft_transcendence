import { getSocketStatus } from "../../App";

const socketStatus = getSocketStatus();

var credentials: RequestCredentials = "include";

export async function getFriends(userUuid: string) {
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

	var url: string = process.env.REACT_APP_BACK_URL + "/user/friends/" + userUuid;
	var requestOptions = {
		method: 'GET',
		headers: myHeaders,
		credentials: credentials
	};

	let friends = await (await fetch(url, requestOptions)).json();
	if (friends.statusCode === 401) {
		window.location.replace(process.env.REACT_APP_BACK_URL + "/auth/login");
	}
	return await friends;
}

export function addInFriend(userUuid: string) {
	socketStatus.emit('addFriend', userUuid);
}

export function removeFromFriend(userUuid: string) {
	removeFriend(userUuid);
}

export async function addFriend(friendUuid: string) {
	var url: string = process.env.REACT_APP_BACK_URL + "/user/addFriend";

	var urlencoded = new URLSearchParams();
	urlencoded.append("userUuidToHandle", friendUuid);

	var requestOptions = {
		method: 'POST',
		body: urlencoded,
		credentials: credentials
	};

	let result = await (await fetch(url, requestOptions)).json();
	if (result.statusCode === 401) {
		window.location.replace(process.env.REACT_APP_BACK_URL + "/auth/login");
	}
}

export async function removeFriend(friendUuid: string) {
	var url: string = process.env.REACT_APP_BACK_URL + "/user/removeFriend";

	var urlencoded = new URLSearchParams();
	urlencoded.append("userUuidToHandle", friendUuid);

	var requestOptions = {
		method: 'POST',
		body: urlencoded,
		credentials: credentials
	};

	let result = await (await fetch(url, requestOptions)).json();
	if (result.statusCode === 401) {
		window.location.replace(process.env.REACT_APP_BACK_URL + "/auth/login");
	}
}