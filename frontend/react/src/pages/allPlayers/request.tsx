var credentials: RequestCredentials = "include";

export async function getAllUuidWithUserNameWithoutMe(myUserUuid: string) {
	const url : string = "/user/allUuidWithUserName";
	var requestOptions = {
		method: 'GET',
        credentials: credentials
	};

	let users = await (await fetch(url, requestOptions)).json();
	if (users.statusCode === 401) {
		window.location.assign("/auth/login");
	}
	for (let i = 0; i < users.length; i++) {
		if (users[i].userUuid === myUserUuid) {
			users.splice(i, 1);
			break;
		}
	}
	return await users;
}

export async function addFriend(friendUuid: string) {
	var url: string = "/user/makeFriendRequest";

	var urlencoded = new URLSearchParams();
	urlencoded.append("userUuid", friendUuid);

	var requestOptions = {
		method: 'POST',
		body: urlencoded,
		credentials: credentials
	};

	let result = await (await fetch(url, requestOptions)).json();
	if (result.statusCode === 401) {
		window.location.assign("/auth/login");
	}
	return await result;
}

export async function removeFriend(friendUuid: string) {
	var url: string = "/user/removeFriend";

	var urlencoded = new URLSearchParams();
	urlencoded.append("userUuid", friendUuid);

	var requestOptions = {
		method: 'POST',
		body: urlencoded,
		credentials: credentials
	};

	let result = await fetch(url, requestOptions);
	console.log("result", result);
	if (result.status === 401) {
		window.location.assign("/auth/login");
	}
	return result.json();
}

export async function getMyBlocked() {
	const url : string = "/user/myBlocked";
	var requestOptions = {
		method: 'GET',
		credentials: credentials
	};

	let users = await (await fetch(url, requestOptions)).json();
	if (users.statusCode === 401) {
		window.location.assign("/auth/login");
	}
	return await users;
}

export async function addBlocked(friendUuid: string) {
	var url: string = "/user/addBlocked";

	var urlencoded = new URLSearchParams();
	urlencoded.append("userUuid", friendUuid);

	var requestOptions = {
		method: 'POST',
		body: urlencoded,
		credentials: credentials
	};

	let result = await (await fetch(url, requestOptions)).json();
	if (result.statusCode === 401) {
		window.location.assign("/auth/login");
	}
	return await result;
}

export async function removeBlocked(friendUuid: string) {
	var url: string = "/user/removeBlocked";

	var urlencoded = new URLSearchParams();
	urlencoded.append("userUuid", friendUuid);

	var requestOptions = {
		method: 'POST',
		body: urlencoded,
		credentials: credentials
	};

	let result = await (await fetch(url, requestOptions)).json();
	if (result.statusCode === 401) {
		window.location.assign("/auth/login");
	}
	return await result;
}