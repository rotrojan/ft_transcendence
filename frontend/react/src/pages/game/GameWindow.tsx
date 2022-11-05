import "./Game.css"
import React from 'react'
import { getSocketPong } from "../../Home"
import { Navigate } from "react-router-dom";
import { Ball, Paddle, GameWindowState, ColorSelector } from "./element"
import Canvas from "./Canvas"

const socket = getSocketPong();

const PADDLE_GAP = 3;
const PADDLE_DEP = 2;
// TO DO : understand why env variable is not working

export class GameWindow extends React.Component<{ id: string }, GameWindowState> {
	constructor(props: any) {
		super(props);

		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.state = {
			matchId: "",
			ballY: 47.1,
			ballX: 48.6,
			scoreLeft: 0,
			scoreRight: 0,
			timeoutId: 0,
			paddleLeftY: 50,
			paddleRightY: 50,
			paddleSize: 20,
			isGameOver: false,
			playerLeft: "",
			playerRight: "",
			matchMaking: false,
			playerLeftName: "",
			playerRightName: ""
		};
	}

	componentDidMount() {
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("mousemove", this.handleMouseMove);
		this.gameLoop();
	}


	gameLoop() {
		socket.on('game', (data: GameWindowState) => {
			this.setState({
				matchId: data.matchId,
				ballX: data.ballX,
				ballY: data.ballY,
				scoreLeft: data.scoreLeft,
				scoreRight: data.scoreRight,
				paddleLeftY: data.paddleLeftY,
				paddleRightY: data.paddleRightY,
				paddleSize: data.paddleSize,
				isGameOver: data.isGameOver,
				playerLeft: data.playerLeft,
				playerRight: data.playerRight,
				matchMaking: data.matchMaking,
				playerLeftName: data.playerLeftName,
				playerRightName: data.playerRightName,
			});
		})
	}

	componentWillUnmount() {
		clearTimeout(this.state.timeoutId);
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("mousemove", this.handleMouseMove);
	}

	handleMouseMove(event: MouseEvent) {
		socket.emit('handlePaddle', { deltaPaddle: (event.movementY / 2), matchId: this.state.matchId });
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
			socket.emit('handlePaddle', { deltaPaddle: deltaPaddleY, matchId: this.state.matchId });
		}
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
			<>
				<h2 className="PlayerName Left">{this.state.playerLeftName}</h2>
				<h2 className="PlayerName Right">{this.state.playerRightName}</h2>
				{/* <Paddle x={PADDLE_GAP} y={this.state.paddleLeftY} size={this.state.paddleSize} /> */}
				{/* <Paddle x={70 - PADDLE_GAP} y={this.state.paddleRightY} size={this.state.paddleSize} /> */}
				<div className="Score Right">{String(this.state.scoreRight).padStart(2, '0')}</div>
				<div className="Score Left">{String(this.state.scoreLeft).padStart(2, '0')}</div>
				{/* <Ball x={this.state.ballX} y={this.state.ballY} /> */}
				<ColorSelector />
			</>
			<Canvas ballX={this.state.ballX} ballY={this.state.ballY} paddleLeftY={this.state.paddleLeftY} paddleRightY={this.state.paddleRightY} paddleSize={this.state.paddleSize} playerLeftName={this.state.playerLeftName} playerRightName={this.state.playerRightName} scoreLeft={this.state.scoreLeft} scoreRight={this.state.scoreRight} />
		</div>
	}
}