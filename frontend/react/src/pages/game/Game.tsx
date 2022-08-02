import NavBar from "../../components/NavBar/NavBar"
import "./Game.css"
import React from 'react'
import { io } from 'socket.io-client'

// Create my socket 
const socket = io('http://localhost:3011');

// Connect my socket to server
socket.on("connect", () => {
	console.log("SOCKET FRONT:", socket.id, " : ", socket.connected); 
});

// Send Gamewindow to connected client
const submitGame = (data: GameWindowState) => {
	socket.emit('game', data, (data:GameWindowState) => {
		return (data);
	});

}

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
	isGameOver: boolean
}


class GameWindow extends React.Component<{}, GameWindowState> {
	constructor(props: any) {
		super(props);

		this.handleKeyDown = this.handleKeyDown.bind(this);

		this.state = {
			ballY: 48,
			ballX: 46.7,
			ballSpeedX: 0,
			ballSpeedY: 0,
			scoreLeft: 0,
			scoreRight: 0,
			gameLoopTimeout:100, // time between game loops
			timeoutId: 0,
			paddleLeftY: 50,
			paddleLeftX: 1,
			paddleRightX: 79,
			paddleRightY: 50,
			isGameOver: false
		};
	}

	componentDidMount() {
		this.initGame();
		window.addEventListener("keydown", this.handleKeyDown);
		this.gameLoop();
	}

	initGame() {}

	gameLoop() {
		let timeoutId = setTimeout(() => {
			if (!this.state.isGameOver) {
				this.moveBall();
				if (this.state.scoreLeft === 10 || this.state.scoreRight === 10) {
					this.setState({ isGameOver: true });
					this.resetGame();
				}
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
		// submitGame(this.state); // Send GameWindow to other user
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
		// Receive GameWindow from the other player
		// socket.on('game', (data: GameWindowState) => {
		// 	console.log("BALL:", data.ballX, data.ballY);
		// })
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
			socket.emit('handlePaddle', deltaPaddleY);
		}
	}

	resetGame() {
		// this.setState = {
		// 	ballY: 0,
		// 	ballX: 0,
		// 	// randomly choose the direction
		// 	ballSpeedX: 2 * (Math.random() < 0.5 ? 1 : -1),
		// 	ballSpeedY: 2 * (Math.random() < 0.5 ? 1 : -1),
		// 	scoreLeft: 0,
		// 	scoreRight: 0,
		// 	gameLoopTimeout:50, // time between game loops
		// 	timeoutId: 0,
		// 	paddleLeftY: 50,
		// 	paddleLeftX: 1,
		// 	paddleRightX: 79,
		// 	paddleRightY: 50,
		// 	isGameOver: false
		// };
	}

	render() {
		return <div className="GameWindow" id="GameBoard">
			<Paddle x={this.state.paddleLeftX} y={this.state.paddleLeftY} />
			<Paddle x={this.state.paddleRightX} y={this.state.paddleRightY} />
			<div className={"Score" + " " + "Right"}>{String(this.state.scoreRight).padStart(2, '0')}</div>
			<div className={"Score" + " " + "Left"}>{String(this.state.scoreLeft).padStart(2, '0')}</div>
			<Ball x={this.state.ballX} y={this.state.ballY} />
		</div>
	}
}


function Game() {
	// Recuperation de la socket initialiser dans index
	// const socket = getSocket();

	return (<div>
		<NavBar />
		<div className="mainComposant">
			<GameWindow />
		</div>
	</div>)
}

export default Game;