import Popup from 'reactjs-popup';
import { useEffect, useState } from "react";
import { getSocketChat } from "../../Home";
import "./Chat.css";
import Select from "react-select";
import { Room } from "../../type";
import { SelectClass } from "../../components/ChatSideNav/menu/SelectClass";

function JoinAgoraPopup() {
	const socket = getSocketChat();
	const [open, setOpen] = useState(false);
	const [completeRooms, setCompleteRooms] = useState([] as Room[]);
	const [rooms, setRooms] = useState([] as SelectClass[]);
	const [newRoomId, setNewRoomId] = useState("");
	const [isProtected, setIsProtected] = useState(false);
	const [password, setPassword] = useState("");


	
	useEffect(() => {
		function findRooms ()
		{
			socket.emit('findAllJoinableRooms', (rooms: Room[]) => {
				let selectTab: SelectClass[] = rooms.map((room) => new SelectClass(room));
				setRooms(selectTab);
				setCompleteRooms(rooms);
			});
		}
		
		socket.emit('findAllJoinableRooms', (rooms: Room[]) => {
			let selectTab: SelectClass[] = rooms.map((room) => new SelectClass(room));
			setRooms(selectTab);
			setCompleteRooms(rooms);
		})

		socket.on('updateRooms', findRooms);
		socket.on('refreshSelectedRoom', findRooms);
		return () => {
			socket.removeListener('updateRooms', findRooms);
			socket.removeListener('refreshSelectedRoom', findRooms);
		}
	}, [socket]);


	const customStyles = {
		option: (provided: any, state: any) => ({
			...provided,
			color: '#FA0197',
			borderTop: '1px solid #DBACE3',
			boxShadow: '0px 0px 20px #7C4D84',
			backgroundColor: 'rgba(0, 0, 0, 1)',
			padding: 10,
		}),
		control: (styles: any) => ({
			...styles,
			color: '#FA0197',
			border: '1px solid #DBACE3',
			boxShadow: '0px 0px 10px #7C4D84',
			borderRadius: '5px',
			backgroundColor: 'rgba(0, 0, 0, 1)',
			padding: 5,
		}),
		input: (styles: any) => ({
			...styles,
			color: '#FA0197',
		}),
		singleValue: (styles: any) => ({
			...styles,
			color: '#FA0197',
		}),
		noOptionsMessage: (styles: any) => ({
			...styles,
			color: '#FA0197',
			border: '1px solid #DBACE3',
			boxShadow: '0px 0px 10px #7C4D84',
			borderRadius: '5px',
			backgroundColor: 'rgba(0, 0, 0, 1)',
			padding: 5,

		}),
		
	}

	const handleChange = (newValue: any) => {
		setNewRoomId(newValue.value);
		if (completeRooms.find((room) => room.id === newValue.value)?.type === "protected") {
			setIsProtected(true);
		} else {
			setIsProtected(false);
		}
	}

	function Submit() {
		const param = {
			roomId: newRoomId,
			password: password
		}
		socket.emit('joinRoom', param);
		setOpen(false);
	}


	return (
		<div className="Popup-mother">
			<button type="submit" onClick={() => setOpen(true)}> Join Room </button>
			<Popup open={open} closeOnDocumentClick onClose={() => {
				setOpen(false);
			}}>
				<div className='side-menu-popup'>
					<h3>Select a Room :</h3>
					<Select 
						// value={value}
							onChange={handleChange}
							styles={customStyles}
							options={rooms} />
					{isProtected && 
						<input type="password"
								placeholder="Password"
								onChange={(e: { target: { value: any; }; }) => setPassword(e.target.value)}
						/>}
					<button onClick={Submit}>Join</button>
				</div>
			</Popup>
		</div >
	);
}

export default JoinAgoraPopup;

