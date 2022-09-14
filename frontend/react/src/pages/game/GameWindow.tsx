import "./Game.css"
import React from 'react'
import { getSocket } from "../../App" 
import { Navigate } from "react-router-dom";
import { Ball, Paddle, GameWindowState, ColorSelector } from "./element"

const socket = getSocket();
const PADDLE_GAP = 3; // gap between border and paddle in %
const PADDLE_DEP = 2; // need to be a divisor of PADDLE_SIZE defined in PongService in %

export class GameWindow extends React.Component<{ id: number }, GameWindowState> {
	constructor(props: any) {
		super(props);

		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.state = {
			id: 0,
			ballY: 47.1,
			ballX: 48.6,
			scoreLeft: 0,
			scoreRight: 0,
			timeoutId: 0,
			paddleLeftY: 50,
			paddleRightY: 50,
			isGameOver: false,
			playerLeft: "",
			playerRight: "",
			loading: false,
			matchMaking: false,
			playerLeftName: "",
			playerRightName: ""
		};
	}

	componentDidMount() {
		window.addEventListener("keydown", this.handleKeyDown);
		this.gameLoop();
	}


	gameLoop() {
		socket.on('game', (data: GameWindowState) => {
			if (data.matchMaking === false) {
				this.setState({ loading: true });
			} else {
				this.setState({ loading: false });
			}
			this.setState({
				id: data.id,
				ballX: data.ballX,
				ballY: data.ballY,
				scoreLeft: data.scoreLeft,
				scoreRight: data.scoreRight,
				paddleLeftY: data.paddleLeftY,
				paddleRightY: data.paddleRightY,
				isGameOver: data.isGameOver,
				playerLeft: data.playerLeft,
				playerRight: data.playerRight,
				matchMaking: data.matchMaking,
				playerLeftName: data.playerLeftName,
				playerRightName: data.playerRightName
			});
			if (data.isGameOver) {
				socket.emit('resetGame', this.state.id);
			}
		})
		socket.on('leaveGame', (playerName: string) => {
			alert(`${playerName} has left the game`);
		})
	}

	componentWillUnmount() {
		clearTimeout(this.state.timeoutId);
		window.removeEventListener("keydown", this.handleKeyDown);
	}

	handleKeyDown(event: KeyboardEvent) {
		var deltaPaddleY = 0
		switch (event.key) {
			case "ArrowUp":
				deltaPaddleY = -PADDLE_DEP;
				break;
			case "ArrowDown":
				deltaPaddleY = +PADDLE_DEP;
				break;
		}
		if (deltaPaddleY !== 0) {
			socket.emit('handlePaddle', deltaPaddleY, this.props.id);
		}
	}

	ChangeColor() {

	}

	render() {
		return <div className="GameWindow" id="GameBoard">
			{this.state.isGameOver
				&& this.state.playerLeft !== socket.id
				&& this.state.playerRight !== socket.id
				&& (<Navigate to="/endGame/GameOver" replace={true} />)
			}
			{this.state.isGameOver
				&& (this.state.playerLeft === socket.id
					|| this.state.playerRight === socket.id)
				&& (((this.state.scoreLeft > this.state.scoreRight
					&& this.state.playerLeft === socket.id)
					|| (this.state.scoreLeft < this.state.scoreRight
						&& this.state.playerRight === socket.id)) ?
					(<Navigate to="/endGame/win" replace={true} />) :
					(<Navigate to="/endGame/lose" replace={true} />))
			}
			{this.state.loading ? (
				<div className="loader-container">
					<div className="spinner"></div>
				</div>
			) : (
				<>
					<h2 className="PlayerName Left">{this.state.playerLeftName}</h2>
					<h2 className="PlayerName Right">{this.state.playerRightName}</h2>
					<Paddle x={PADDLE_GAP} y={this.state.paddleLeftY} />
					<Paddle x={80 - PADDLE_GAP} y={this.state.paddleRightY} />
					<div className="Score Right">{String(this.state.scoreRight).padStart(2, '0')}</div>
					<div className="Score Left">{String(this.state.scoreLeft).padStart(2, '0')}</div>
					<Ball x={this.state.ballX} y={this.state.ballY} />
                    <ColorSelector />
				</>
			)}
		</div>
	}
}