import { useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Popup from 'reactjs-popup';
import { User } from "../../type";
import { getSocketChat, getSocketStatus } from "../../App";
import NavBar from "../../components/NavBar/NavBar";
import {getMyFriends, getMe} from "../myProfile/request"
import "./Chat.css";

//import {Route, NavLink, HashRouter} from 'react-router-dom'
//import { User } from "../../type";

const socketStatus = getSocketStatus();

socketStatus.on('getUserUuid', () => {
	socketStatus.emit('getUserUuid');
})

function Chat() {
    const socket = getSocketChat();
	const emptyUser: User = { userUuid: "", userName: "" };
	const [user, setUser] = useState(emptyUser);
	const [friends, setFriends] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [messages, setMessages] = useState();
    const [channels, setChannels] = useState([]);
	const [newMessage, setNewMessage] = useState("");

    const [newChannel, setNewChannel] = useState("");

	async function fetchUser() {
		const user = await getMe();
		const friends = await getMyFriends();
		setFriends(friends);
		socketStatus.emit('getFriendsStatus', friends, (data: any) => {
			setFriends(data);
		});
		setUser(user);
	}

	useEffect(() => {
		fetchUser();

		socket.emit('findAllPublicRooms', (rooms:any) => {setChannels(rooms)});
        socket.on('room', (rooms:any) => {
            console.log('getting information');
            setChannels(rooms);
        });
	}, []);


    useEffect(() => {
        socket.emit('getAllMessagesInRoom', selectedRoom, (msgs:any) => {
            setMessages(msgs)});
    }, [selectedRoom, socket]);

    function makeRoom() {
        console.log('creating room ', newChannel);
        socket.emit('createRoom', { name: newChannel, ownerId: user.userUuid, 
            isProtected:false, password: "", type: 'public', 
            userId:user.userUuid 
        });
        console.log(channels);
		setNewChannel("");
        setOpen(false);
    }
    
	function sendMessage()
	{
		socket.emit('createMessage', {senderID: user.userUuid, message: newMessage, roomId: selectedRoom});
		console.log('sending message: ', newMessage);
	}
    
    return ( <div>
        <NavBar />
        <div className="mainComposant">
            <div className="box">
            <button type="submit" onClick={() => setOpen(true)}> New </button>
            <Popup open={open} closeOnDocumentClick onClose={() => {setOpen(false);
             window.location.reload();
            }}>
            <div className='messagePopup'>
                <label htmlFor="messagePopup">Message to :</label>
                <div className='input-flex'>
                    <input type="text" id="messagePopup" name="username"
                        value={newChannel}
                        onChange={(e) => setNewChannel(e.target.value)}
                        autoFocus
                        autoCorrect="off"
                        placeholder="..."
                        minLength={1}
                        maxLength={30}
                        size={30} />
                    <span></span>
                </div>
                <button type="submit" onClick={makeRoom}>Save</button>
            </div>
            </Popup>

                <div className="channel">
                {channels.map((room:any) => (
                        <li key = {room.name} onClick={() => setSelectedRoom(room.name)}>{room.name}</li>
                    ))}
                </div>
            </div>
            <div className="chat">
                <TransitionGroup className="messages">
                    {messages ? (messages as any).map((message:any) => (
                        message.sender.userUuid === user.userUuid ? 
                        (<CSSTransition key={message} timeout={500} classNames="fade">
                        <div className="message_mine">me: {message}</div>
                        </CSSTransition>) : (<CSSTransition key={message} timeout={500} classNames="fade">
                        <div className="message_mine">{message.sender.userName}: {message}</div>
                        </CSSTransition>))
                    ) : null
                    }
                </TransitionGroup>
                <form onSubmit={sendMessage}>
                    <input
                        autoComplete="off"
                        type="text"
						onChange={(e) => setNewMessage(e.target.value)}
                        autoFocus
                    />
                    <button type="submit"> Send </button>
                </form>
            </div>
        </div>

    </div>)
}

export default Chat

