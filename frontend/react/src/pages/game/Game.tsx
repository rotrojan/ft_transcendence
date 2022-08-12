import NavBar from "../../components/NavBar/NavBar"
import "./Game.css"
import React from 'react'
import { getSocket } from "../../App"
import { useState } from "react"
import { useLocation } from "react-router-dom"

const socket = getSocket();

class Ball extends React.Component<{ x: number, y: number }> {
	render() {
		return <div
			style={{
				top: `${this.props.y}%`,
				left: `${this.props.x}%`,
			}}
			className="Ball" />
	}
}

class Paddle extends React.Component<{ x: number, y: number }> {
	render() {
		return <div
			style={{
				top: `${this.props.y}%`,
				left: `${this.props.x}vw`,
			}}
			className="Paddle" />
	}
}

interface GameWindowState {
	ballX: number,
	ballY: number,
	ballSpeedX: number,
	ballSpeedY: number,
	gameLoopTimeout: number,
	timeoutId: any,
	scoreLeft: number,
	scoreRight: number,
	paddleLeftY: number,
	paddleLeftX: number,
	paddleRightX: number,
	paddleRightY: number,
	id: number,
	isGameOver: boolean
}


export class GameWindow extends React.Component<{id:number}, GameWindowState> {
	constructor(props: any) {
		super(props);

		this.handleKeyDown = this.handleKeyDown.bind(this);

		this.state = {
			id : 0,
			ballY: 46.3,
			ballX: 48,
			ballSpeedX: 0,
			ballSpeedY: 0,
			scoreLeft: 0,
			scoreRight: 0,
			gameLoopTimeout:50, // time between game loops
			timeoutId: 0,
			paddleLeftY: 50,
			paddleLeftX: 3,
			paddleRightX: 77,
			paddleRightY: 50,
			isGameOver: false
		};
	}

	componentDidMount() {
		window.addEventListener("keydown", this.handleKeyDown);
		this.gameLoop();
	}


	gameLoop() {
		let timeoutId = setTimeout(() => {
			if (!this.state.isGameOver
				&& this.props.id !== -1
				&& this.props.id !== undefined) {
				this.moveBall();
			}
			this.gameLoop();
		}, this.state.gameLoopTimeout);
		this.setState({ timeoutId });
	}

	componentWillUnmount() {
		clearTimeout(this.state.timeoutId);
		window.removeEventListener("keydown", this.handleKeyDown);
	}

	moveBall() {
		this.setState({id: this.props.id});
		socket.emit('getGame', this.state, (data:GameWindowState) => {
			this.setState({ballX: data.ballX,
				ballY: data.ballY,
				ballSpeedX: data.ballSpeedX,
				ballSpeedY: data.ballSpeedY,
				scoreLeft: data.scoreLeft,
				scoreRight: data.scoreRight,
				paddleLeftY: data.paddleLeftY,
				paddleRightY: data.paddleRightY,
				isGameOver: data.isGameOver	
			});
		});
	}

	handleKeyDown(event: KeyboardEvent) {
		var deltaPaddleY = 0
		switch (event.key) {
			case "ArrowUp":
				deltaPaddleY = -5;
				break;
			case "ArrowDown":
				deltaPaddleY = +5;
				break;
		}
		if (deltaPaddleY !== 0) {
			socket.emit('handlePaddle', deltaPaddleY, this.props.id);
		}
	}

	resetGame() {
	console.log("RESET GAME");
		this.setState({ballSpeedX: 0, ballSpeedY:0});
		
		socket.emit('getGame', this.state, (data:GameWindowState) => {
			this.setState({ballX: data.ballX,
				ballY: data.ballY,
				ballSpeedX: data.ballSpeedX,
				ballSpeedY: data.ballSpeedY,
				scoreLeft: data.scoreLeft,
				scoreRight: data.scoreRight,
				paddleLeftY: data.paddleLeftY,
				paddleRightY: data.paddleRightY});
		});
	}

	render() {
		return <div className="GameWindow" id="GameBoard">
			<button className="ResetButton" onClick={() => this.resetGame()}>Reset</button>
			<Paddle x={this.state.paddleLeftX} y={this.state.paddleLeftY} />
			<Paddle x={this.state.paddleRightX} y={this.state.paddleRightY} />
			<div className="Score Right">{String(this.state.scoreRight).padStart(2, '0')}</div>
			<div className="Score Left">{String(this.state.scoreLeft).padStart(2, '0')}</div>
			<Ball x={this.state.ballX} y={this.state.ballY} />
		</div>
	}
}


function Game() {
	const index = new URLSearchParams(useLocation().search).get('id');
	var id_state : number = index === null ? -1 : parseInt(index);
	const displaying_state = index === null ? {display: "block"} : {display: "none"};
	const [displaying, setDisplaying] = useState(displaying_state);
	const [id, setId] = useState(id_state);

	function matchMaking() {
		socket.emit('getPlayer', (id_game: number, launch: boolean) => {
			setDisplaying({display:"none"});
			setId(id_game);
			console.log(id, id_game);

		});
	}
	return (<div>
		<NavBar />
		<div className="mainComposantGame">
			<GameWindow id={id}/>
			<button style={displaying}
				 className="matchMakingButton"
				  onClick={() => matchMaking()}>
					Find another player
			</button>
		</div>
	</div>)
}

export default Game;