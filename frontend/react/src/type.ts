export type User = {
	userUuid: string;
	userName: string;
	online?: boolean;
	twoFactorAuth?: boolean;
	wins?: number;
	losses?: number;
	friends?: User[];
}

export type Match = {
	matchId?: string;
	score1?: number;
	score2?: number;
}

export interface GameWindowState {
	scoreLeft: number,
	playerLeftName: string,
	playerRightName: string,
	scoreRight: number,
	matchId: number,
	isGameOver: boolean,
	begin: boolean,
}

export type Players = {
	userUuid: string;
	userName: string;
	online: boolean;
}

export type Room = {
	id: string,
	name: string,
	type: string,
	bannedTime: boolean,
	mutedTime: boolean,
}