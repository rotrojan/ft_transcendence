import NavBar from "../../components/NavBar/NavBar"
import "./Profil.css"
import { GetMatchHistory, getMyFriends, getMe, disableTwoFactorAuth } from "./request"
import { User } from "../../type";
import { useEffect, useState } from "react";
import { getSocketStatus } from "../../App";
import EditUsernamePopUp from "../../components/EditUsernamePopUp/EditUsernamePopUp"
import InvitePopUp from "../../components/InvitePopUp/InvitePopUp";
import Cookies from "js-cookie";
import Active2FAPopUp from "../../components/Active2FAPopUp/Active2FAPopUp";

const socketStatus = getSocketStatus();

socketStatus.on('getUserUuid', () => {
	socketStatus.emit('getUserUuid');
})

function MyProfile() {
	const emptyUser: User = { userUuid: "", userName: "" };
	const [user, setUser] = useState(emptyUser);
	const [matchHistory, setMatchHistory] = useState([]);
	const [friends, setFriends] = useState([]);

	async function fetchUser() {
		const user = await getMe();
		const matchHistory = await GetMatchHistory(user.userName);
		const friends = await getMyFriends();
		setFriends(friends);
		socketStatus.emit('getFriendsStatus', friends, (data: any) => {
			setFriends(data);
		});
		setMatchHistory(matchHistory);
		setUser(user);
	}

	useEffect(() => {
		fetchUser();
	}, []);

	async function disable2FA() {
		let new_user = await disableTwoFactorAuth();
		setUser(new_user);
	}

	function logOut() {
		Cookies.remove('access_token', { path: "/" });
		window.location.replace(process.env.REACT_APP_FRONT_URL + "/");
	}

	return (<>
		<NavBar />
		<div className="mainComposantProfile">
			<div className="flex">
				<div className="info container">
					<div className="firstLine">
						<h3>Profile</h3>
						<button onClick={logOut}>Log out</button>
					</div>
					<ul>
						<li className="flex-li">
							<div className="Username">Username : {user.userName}</div>
							<EditUsernamePopUp />
						</li>
						<li>Wins : {user.wins}</li>
						<li>Losses : {user.losses}</li>
					</ul>
					{user.twoFactorAuth === false ?
							<Active2FAPopUp /> :
						<button className="enable" onClick={disable2FA}>Disable two-factor authentication</button>
					}
				</div>
				<a className="pp-containers" href="./myProfile/editProfilePicture">
					<div className="pp">
						<img src={process.env.REACT_APP_BACK_URL + "/user/myPicture"} alt={"Avatar of " + user.userName} />
					</div>
					<div className="pphover">Edit
					</div>
				</a>
			</div>
			<div className="flex">
				<div className="friends container">
					<h3>Friends</h3>
					<table>
						<thead>
							<tr>
								<th>UserName</th>
								<th>Status</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{friends.map((users: any) => {
								return (<tr key={users.userUuid}>
									<td><a href={"./profile?uid=" + users.userUuid}>{users.userName}</a></td>
									{users.online ? <td>Online</td> : <td>Offline</td>}
									<td><InvitePopUp userName={users.userName} userUuid={users.userUuid} user={user} /></td>
								</tr>);
							})}
						</tbody>
					</table>
				</div>
				<div className="stats container">
					<h3>Match History</h3>
					<table>
						<thead>
							<tr>
								<th>Other Player</th>
								<th>My Score</th>
								<th>Other Score</th>
							</tr>
						</thead>
						<tbody>
							{matchHistory.map((match: any) => {
								return (<tr key={match.matchId}>
									<td>{user.userUuid === match.user1?.userUuid ? (match.user2?.userName) : (match.user1?.userName)}</td>
									<td>{user.userUuid === match.user1?.userUuid ? (match.score1) : (match.score2)}</td>
									<td>{user.userUuid === match.user1?.userUuid ? (match.score2) : (match.score1)}</td>
								</tr>);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</>)
}

export default MyProfile