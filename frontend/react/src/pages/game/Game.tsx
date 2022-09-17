import NavBar from "../../components/NavBar/NavBar"
import "./Game.css"
import { getSocket } from "../../App" 
import { useState } from "react"
import { useLocation } from "react-router-dom";
import { GameWindow } from "./GameWindow"

// create setModal;

const socket = getSocket();

function Game() {
	var index = new URLSearchParams(useLocation().search).get('id');
	const displaying_state = index === null ? { display: "block" } : { display: "none" };
	const [displaying, setDisplaying] = useState(displaying_state);
	index = index === null ? "" : index;
	const [id, setId] = useState(index);
	const [loading, setLoading] = useState(false);
	const uid = localStorage.getItem('uid');
	const userName = localStorage.getItem('userName');

	
	if (id !== "") {
		socket.emit('joinGame', index, userName);
	}
	
	function matchMaking() {
		let arg = {
			"userUuid": uid,
			"userName": userName
		}
		socket.emit('getPlayer', arg , (matchId: string) => {
			setDisplaying({ display: "none" });
			if (matchId === "")
				setLoading(true);
			else
				setLoading(false);
		});
	}
	return (<>
		<NavBar />
		<div className="mainComposantGame">
			<GameWindow id={id} />
			<button style={displaying}
				className="matchMakingButton"
				onClick={() => matchMaking()}>
				Find another player
			</button>
		</div>
	</>)
}

export default Game;