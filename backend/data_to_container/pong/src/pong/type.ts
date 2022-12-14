export interface GameWindowState {
	matchId: string,
	ballX: number,
	ballY: number,
	ballColor: string,
	ballSpeedX: number,
	ballSpeedY: number,
	scoreLeft: number,
	scoreRight: number,
	paddleLeftY: number,
	paddleRightY: number,
	paddleSize: number,
	
	playerLeftUid: string,
	playerRightUid: string,
	playerLeft: string,
	playerRight: string,
	playerLeftName: string,
	playerRightName: string,
	
	matchMaking: boolean,
	begin: boolean,
	isGameOver: boolean,
}