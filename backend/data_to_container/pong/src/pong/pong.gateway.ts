import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PongService } from "./pong.service";
import { GameWindowState } from "./type";
import { AuthGuard } from './pong.guards';
import { getPlayerDto } from './dto/getPlayer.dto';
import { AcceptInviteDto } from './dto/acceptInvite.dto';
import { invitePlayerDto } from './dto/invitePlayer.dto';


const INTERVAL_TIME = 30; // in ms

var games: GameWindowState[] = [];

@WebSocketGateway({ cors: { origin: '*' }, }) // enable CORS everywhere
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger('PongGateway');

	constructor(private readonly PongService: PongService) { }

	@Interval(INTERVAL_TIME)
	GameLoop() {
		for (let i: number = 0; i < games.length; i++) {
			if (!games[i].isGameOver && games[i].playerLeft) {
				this.sendGametoRoom(i);
			}
		}
	}

	@SubscribeMessage('joinGame') // For spectator
	joinGame(client: Socket, id: number) {
		client.join(id.toString());
	}

	// Invite a specific user to a game
	@SubscribeMessage('invitePlayer')
	invitePlayer(client: Socket, invitePlayer: invitePlayerDto) {
		console.log("invitePlayerBackend", invitePlayer);
		let arg : getPlayerDto = {userUuid: invitePlayer.userUuid,
			userName: invitePlayer.userName};
		if (games.length == 0)
			this.GameLoop(); // start game loop
		for (var i: number = 0; i < games.length; i++) {
			if (games[i].playerLeft == "" && games[i].playerRight == "") {
				// reuse old structure if possible
				client.join(i.toString());
				games[i] = this.PongService.initGame(i, arg, client.id);
				games[i].playerRightUid = invitePlayer.invitedUid; // mark match reserved to avoid matchmaking 
				invitePlayer.id = i;
				console.log("invitePlayer", "send to other players invitation");
				this.server.emit('invitePlayer', invitePlayer);
				return i;
			}
		}
		// create new game
		games.push(this.PongService.initGame(i, arg, client.id));
		games[i].playerRightUid = invitePlayer.invitedUid; // mark match reserved to avoid matchmaking 
		console.log("GAMES[", i, "]", games[i]);
		client.join(i.toString());
		invitePlayer.id = i;
		// send invitation to all players
		console.log("invitePlayer", "send to other players invitation");
		this.server.emit('invitePlayer', invitePlayer);
		return i;
	}

	@SubscribeMessage('acceptInvite') 
	acceptInvite(client: Socket, acceptInvite: AcceptInviteDto) {
		let arg : getPlayerDto = {userUuid: acceptInvite.userUuid,
			 userName: acceptInvite.userName};
		let id: number = acceptInvite.id; // get id from invitation
		client.join(id.toString());
		games[id] = this.PongService.initSecondPlayer(games[id], arg, client.id);
		return id;
	}

	// Launch a game and find a match for the player
	@UseGuards(AuthGuard)
	@SubscribeMessage('getPlayer')
	// clientInfo : {userUid, username}
	getPlayer(client: Socket, clientInfo: getPlayerDto): number {
		let auth_token : string = client.handshake.headers.authorization.split(' ')[1];
		console.log("Auth token", auth_token);
		if (games.length == 0)
			this.GameLoop(); // start game loop
		for (var i: number = 0; i < games.length; i++) {
			if (games[i].playerLeft == "" && games[i].playerRight == "") {
				// reuse old structure if possible
				client.join(i.toString());
				games[i] = this.PongService.initGame(i, clientInfo, client.id);
				return i;
			} else if (games[i].playerRight === undefined && // verify if game is not full
				games[i].playerLeftUid !== clientInfo.userUuid) { // verify if player is not already in game
				// find a game with only one player
				client.join(i.toString());
				games[i] = this.PongService.initSecondPlayer(games[i], clientInfo, client.id);
				return i;
			} else {
				console.log("Cannot join game", games[i].playerLeftUid, clientInfo.userUuid);
			}
		}
		// create new game
		games.push(this.PongService.initGame(i, clientInfo, client.id));
		console.log("GAMES[", i, "]", games[i]);
		client.join(i.toString());
		return i;
	}

	@SubscribeMessage('getGames')
	getGames(client: Socket): GameWindowState[] {
		return games;
	}

	sendGametoRoom(id: number) {
		if (id == undefined)
        	return;
		if (games[id].matchMaking == false) {
			try {
				this.server.to(id.toString()).emit('game', games[id]);
			} catch (error) {
				console.log("ERROR IN SEND GAME TO ROOM", error);
			}
			return ;
		}
		games[id] = this.PongService.sendGametoRoom(games[id]);
		try {
			if (games[id].isGameOver)
            	console.log("game over", games[id].isGameOver, games[id].scoreRight, games[id].scoreLeft, games[id].playerLeft);
			this.server.to(id.toString()).emit('game', games[id]);
		} catch (error) {
			console.log("ERROR IN SEND GAME TO ROOM", error);
		}
	}

	@SubscribeMessage('handlePaddle')
	handlePaddle(client: Socket, args: any): void {
		games[args[1]] = this.PongService.handlePaddle(games[args[1]], args[0], client.id);
	}

	@SubscribeMessage('resetGame')
	resetGame(client: Socket, id: number) {
		client.leave(id.toString());
		games[id] = this.PongService.resetGame(games[id]);	
		return games[id];
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		for (let i: number = 0; i < games.length; i++) {
			if (games[i].playerLeft === client.id || games[i].playerRight === client.id) {
				games[i] = this.PongService.resetGame(games[i]);
				if (games[i].playerLeft === client.id) {
					this.server.to(i.toString()).emit('leaveGame', games[i].playerLeftName);
				} else {
					this.server.to(i.toString()).emit('leaveGame', games[i].playerRightName);
				}
				this.resetGame(client, i);
			}
		}
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}
}