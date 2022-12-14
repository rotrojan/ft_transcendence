import NavBar from "../../components/NavBar/NavBar"
import "./Profil.css"
import { GetMatchHistory, getMyFriends, getMe, disableTwoFactorAuth, logout } from "./request"
import { User } from "../../type";
import { useEffect, useState } from "react";
import { getSocketStatus } from "../../Home";
import star from "../../assets/star.jpg";
import starEmpty from "../../assets/starEmpty.jpg";
import EditUsernamePopUp from "../../components/EditUsernamePopUp/EditUsernamePopUp"
import InvitePopUp from "../../components/InvitePopUp/InvitePopUp";
import Active2FAPopUp from "../../components/Active2FAPopUp/Active2FAPopUp";
import { Link, useNavigate } from "react-router-dom";

const socketStatus = getSocketStatus();

function MyProfile() {
	const [user, setUser] = useState({} as User);
	const [matchHistory, setMatchHistory] = useState([]);
	const [friends, setFriends] = useState([]);
	let navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
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
		fetchData().catch(console.error);
	}, []);

	useEffect(() => {
		socketStatus.on('refreshUserData', (updatedUser: User) => {
			setUser(updatedUser);
		})
		socketStatus.on('refreshUserData2', () => {
			const fetchData = async () => {
				const user = await getMe();
				setUser(user);
			}
			fetchData();
		})
	}, []);


	async function disable2FA() {
		let new_user = await disableTwoFactorAuth();
		setUser(new_user);
	}

	async function logOut() {
		await logout()
		navigate("/");
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
					{
						user.twoFactorAuth === false ?
							<Active2FAPopUp /> :
							<button className="enable" onClick={disable2FA}>Disable two-factor authentication</button>
					}
				</div>
				<Link className="pp-containers" to="/EditProfilePicture">
					<div className="pp">
						<img src={"/user/myPicture"} alt={"Avatar of " + user.userName} />
					</div>
					<div className="pphover">
						<p>Edit</p>
					</div>
				</Link>
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
							{
								friends.map((users: any) => {
									return (<tr key={users.userUuid}>
										<td><Link to={"/profile?uid=" + users.userUuid}>{users.userName}</Link></td>
										{users.online ?
											<>
												<td>Online</td>
												<td><InvitePopUp userName={users.userName} userUuid={users.userUuid} user={user} /></td>
											</>
											: <td>Offline</td>}
									</tr>);
								})}
						</tbody>
					</table>
				</div>
				<div className="stats container">
					<h3>Match History</h3>
					<div className="achievements">
						{user.wins !== undefined && user.wins >= 5 ?
							<img src={star} alt="achievements" /> :
							<img src={starEmpty} alt="achievements" />}
						{user.wins !== undefined && user.wins >= 10 ?
							<img src={star} alt="achievements" /> :
							<img src={starEmpty} alt="achievements" />}
						{user.wins !== undefined && user.wins >= 15 ?
							<img src={star} alt="achievements" /> :
							<img src={starEmpty} alt="achievements" />}
					</div>
					<table>
						<thead>
							<tr>
								<th>Other Player</th>
								<th>My Score</th>
								<th>Other Score</th>
							</tr>
						</thead>
						<tbody>
							{
								matchHistory.map((match: any) => {
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