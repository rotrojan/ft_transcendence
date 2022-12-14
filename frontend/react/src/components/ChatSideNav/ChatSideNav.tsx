import { useEffect, useState } from "react";
import { getSocketChat } from "../../Home";
import "./ChatSideNav.css";
import AddOrRemoveAdmin from "./menu/AddOrRemoveAdmin";
import ChangePassword from "./menu/ChangePassword";
import DeletePassword from "./menu/DeletePassword";
import InviteUser from "./menu/InviteUser";
import LeaveRoom from "./menu/LeaveRoom";
import SetPassword from "./menu/SetPassword";
import PunishUser from "./menu/PunishUser";
import UnpunishUser from "./menu/UnpunishUser";
import GiveOwnership from "./menu/GiveOwnership";
import DeleteRoom from "./menu/DeleteRoom";

function ChatSideNav({ Room }: any) {
    const socket = getSocketChat();
    const [amIAdmin, setAmIAdmin] = useState(false);
    const [amIOwner, setAmIOwner] = useState(false);
    var sidenav = document.getElementById("mySidenav");

    useEffect(() => {
        if (Room && Room !== undefined && Room.id !== undefined) {
            socket.emit('amIAdmin', { uuid: Room.id }, (Admin: boolean) => {
                setAmIAdmin(Admin);
            })
            socket.emit('amIOwner', { uuid: Room.id }, (Owner: boolean) => {
                setAmIOwner(Owner);
            })
        }
    }, [Room, socket]);

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
                    {
                        Room.type === "private" &&
                        <li><InviteUser room={Room} /></li>
                    }
                    <li><LeaveRoom room={Room} /></li>
                    {/* Admin */}
                    {amIAdmin &&
                        <>
                            <li><AddOrRemoveAdmin room={Room} AddAdmin={true} /></li>
                            <li><AddOrRemoveAdmin room={Room} AddAdmin={false} /></li>
                            <li><PunishUser room={Room} ban={false} /></li>
                            <li><UnpunishUser room={Room} ban={false} /></li>
                            <li><PunishUser room={Room} ban={true} /></li>
                            <li><UnpunishUser room={Room} ban={true} /></li>
                        </>
                    }
                    {/* Owner */}
                    {amIOwner && Room.type === "public" &&
                        <>
                            <li><SetPassword room={Room} /></li>
                        </>
                    }
                    {amIOwner && Room.type === "protected" &&
                        <>
                            <li><ChangePassword room={Room} /></li>
                            <li><DeletePassword room={Room} /></li>
                        </>
                    }
                    {amIOwner &&
                        <>
                            <li><GiveOwnership room={Room} /></li>
                            <li><DeleteRoom room={Room} /></li>
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