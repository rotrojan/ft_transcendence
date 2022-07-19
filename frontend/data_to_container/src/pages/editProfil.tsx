import NavBar from "../components/NavBar"
import Head from 'next/head'
import styles from "../styles/Profil.module.css"
import { getSocket } from "../pages/index"
import Image from 'next/image';

function editProfil() {
	// Recuperation de la socket initialiser dans index
	const socket = getSocket();

	return (<div>
		<Head>
			<title>Mon Profil</title>
			<meta name="description" content="Generated by create next app" />
			<link rel="icon" href="./public/favicon.ico" />
		</Head>
		<NavBar />
		<div className={styles.mainComposant}>
			<div className={styles.flex}>
				<div className={styles.info}>
					<h3>Profil</h3>
				</div>
				<div className={styles.pp}>
					<a href="./editProfil">Editer</a>
				</div>
			</div>
			<div className={styles.flex}>
				<div className={styles.friends}>
					<h3>Amis</h3>
				</div>
				<div className={styles.stats}>
					<h3>Statistiques</h3>
				</div>
			</div>
		</div>
	</div>)
}

export default editProfil