import React, { useCallback, useEffect, useState } from 'react';
import { Context } from 'vm';
import ReceivePopUp from '../components/ReceivePopUp/ReceivePopUp';
import { getSocketPong } from "../App" 

const ModalContext = React.createContext({});
const socket = getSocketPong();

const Modal = (({ modal, unSetModal }: any) => {
	console.log("MODAL", modal);
	useEffect(() => {
		const bind = (event: any) => {
			console.log(event.keyCode);
			unSetModal();
		}

		document.addEventListener('keyup', bind);
		return () => document.removeEventListener('keyup', bind);
	}, [modal, unSetModal])

	return (
		<ReceivePopUp modal={modal} />
	)
});

const useModal = (): Context => {
	const context = React.useContext(ModalContext);
	if (!context) {
		throw new Error('useModal must be used within a ModalProvider');
	}
	return context;
}

const ModalProvider = (props: any) => {
	const [modal, setModal] = useState();
	
	socket.on('invitePlayer', (data: any) => {
		console.log("INVITE PLAYER ON", data);
		if (data.userName === localStorage.getItem('userName')) {
			console.log("You are invite by", data.userName);
			setModal(data);
		}
	})
	const unSetModal = useCallback(() => {
		setModal(undefined);
	}, [setModal])
	
	return (
		<ModalContext.Provider value={{ unSetModal, setModal }} {...props}>
			{props.children}
			{modal && <Modal modal={modal} unSetModal={unSetModal} />}
		</ModalContext.Provider>
	);
}

export { ModalProvider, useModal }
