import { useEffect, useState } from "react";
import { getSocketChat } from "../../App";
import "./ChatSideNav.css";
import AddOrRemoveAdmin from "./menu/AddOrRemoveAdmin";
import InviteUser from "./menu/InviteUser";
import LeaveRoom from "./menu/LeaveRoom";
import SetPassword from "./menu/SetPassword";

function ChatSideNav({ Room }: any) {
    const socket = getSocketChat();
    const [amIAdmin, setAmIAdmin] = useState(false);
    const [amIOwner, setAmIOwner] = useState(false);
    var sidenav = document.getElementById("mySidenav");

    useEffect(() => {
        if (Room && Room !== undefined && Room.id !== undefined) {
            console.log("USE EFFECT AM I", Room.id);
            socket.emit('amIAdmin', { uuid: Room.id }, (amIAdmin: boolean) => {
                setAmIAdmin(amIAdmin);
                console.log("AM I ADMIN ?", amIAdmin);
            })
            socket.emit('amIOwner', { uuid: Room.id }, (amIOwner: boolean) => {
                setAmIOwner(amIOwner);
            })
        }
    }, [Room]);

    function openNav() {
        if (sidenav !== null) {
            sidenav.classList.add("active");
        }
    }

    function closeNav() {
        if (sidenav !== null) {
            sidenav.classList.remove("active");
        }
    }

    return (
        <>
            <div id="mySidenav" className="sidenav">
                <button id="closeBtn" className="close" onClick={closeNav}>×</button>
                <ul>
                    {/* All User */}
                    <li><InviteUser /></li>
                    <li><LeaveRoom name={Room.name} /></li>
                    {/* Admin */}
                    {amIAdmin &&
                        <>
                            <li><AddOrRemoveAdmin room={Room} AddAdmin={true} /></li>
                            <li><AddOrRemoveAdmin room={Room} AddAdmin={false} /></li>
                            <li><a href="#">Mute User</a></li>
                            <li><a href="#">Unmute User</a></li>
                            <li><a href="#">Ban User</a></li>
                            <li><a href="#">Unban User</a></li>
                        </>
                    }
                    {/* Owner */}
                    {amIOwner &&
                        <>
                            <li><SetPassword room={Room}/></li>
                            <li><a href="#">Edit Password</a></li>
                            <li><a href="#">Remove Password</a></li>
                            <li><a href="#">Give Ownership</a></li>
                            <li><a href="#">Delete Room</a></li>
                        </>
                    }
                </ul>
            </div>

            <button id="openBtn" onClick={openNav}>
                <span className="burger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>
        </>
    )
}

export default ChatSideNav;