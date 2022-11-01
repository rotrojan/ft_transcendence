import {
  Logger,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { ChatMember, Message, Room, user } from 'src/bdd/index';
import { ChatExceptionFilter } from './chat-exception.filter';
import { ChatService } from './chat.service';
import { CreateMessageDto, CreateRoomDto, UuidDto } from './dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DoubleUuidDto } from './dto/double-uuid';
import { FilterByAdminRightsDto } from './dto/filter-by-admin-rights.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { PunishUserDto } from './dto/punish-user.dto';
import { RemovePunishmentDto } from './dto/remove-punishment.dto';
import { SetAdminDto } from './dto/set-admin.dto';

@UseGuards(JwtAuthGuard)
// @UseGuards(RolesGuard)
// @UseFilters(ChatExceptionFilter)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    // forbidNonWhitelisted: true,
  }),
)
@WebSocketGateway({
  cors: { origin: process.env.REACT_APP_FRONT_URL, credentials: true },
  namespace: 'chat',
})
export class ChatGateway
  implements /*OnGatewayInit,*/ OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  // The socket.io server responsible for handling (receiviing and emitting) events
  @WebSocketServer()
  server: Server;

  // A logger for debugging purposes
  private logger: Logger = new Logger('ChatGateway');

  // @Authorized('notBanned', 'notBlocked', 'notMuted')
  @SubscribeMessage('createMessage')
  async createMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @Req() { user }: { user: user },
    @ConnectedSocket() client: Socket,
  ): Promise<Message> {
    const message: Message = await this.chatService.createMessage(
      createMessageDto,
      user,
    );
    this.logger.debug('Creating a message');
    this.logger.debug(message.sender.room.id);
    client.to(message.sender.room.id).emit('updateMessages');
    // this.server.emit('updateRooms');
    return message;
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @MessageBody() createRoomDto: CreateRoomDto,
    @Req() { user }: { user: user },
  ): Promise<Room> {
    const newRoom: Room = await this.chatService.createRoom(
      createRoomDto,
      user,
    );
    this.server.socketsJoin(newRoom.id);
    this.server.emit('updateRooms');
    return newRoom;
  }

  // @UseGuards(ProtectedRoomGuard)
  @UseFilters(ChatExceptionFilter)
  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @Req() { user }: { user: user },
  ) {
    const chatMember: ChatMember = await this.chatService.joinRoom(
      joinRoomDto,
      user,
    );
    this.server.socketsJoin(chatMember.room.id);
    this.logger.log(
      `User ${user.userUuid} is joining room ${joinRoomDto.roomId}`,
    );

    return chatMember;
  }

  /*
  @Authorized('notBanned')
  @SubscribeMessage('joinPrivateRoom')
  async joinPrivateRoom(@MessageBody() joinPrivateRoomDto: StringDto) {
    const room: Room = await this.chatService.joinPrivateRoom(
      joinPrivateRoomDto,
    );
    this.server.socketsJoin(room.id);
    return room;
  }
  */

  // @Authorized('notBlocked')
  //return the room id
  @SubscribeMessage('joinDMRoom')
  async joinDMRoom(
    @MessageBody() recipiendId: UuidDto,
    @Req() { user }: { user: user },
  ): Promise<string> {
    const room: Room = await this.chatService.joinDMRoom(
      user,
      recipiendId.uuid,
    );
    this.server.socketsJoin(room.id);
    return room.id;
  }

  // @Authorized('notBanned')
  @SubscribeMessage('findAllMessagesInRoom')
  async findAllMessagesInRoom(
    @MessageBody() findAllMessagesInRoomDto: UuidDto,
  ): Promise<Message[]> {
    console.log('bonjour');
    const messages: Message[] = await this.chatService.findAllMessagesInRoom(
      findAllMessagesInRoomDto,
    );
    return messages;
  }

  // @Authorized('notBanned')
  // @SubscribeMessage('findLastMessageInRoom')
  // async findLastMessageInRoom(
  //   @MessageBody() findLastMessageInRoomDto: UuidDto,
  // ): Promise<Message> {
  //   return await this.chatService.findLastMessageInRoom(
  //     findLastMessageInRoomDto,
  //   );
  // }

  // @Roles('owner', 'admin')
  @SubscribeMessage('setAdmin')
  async addAdmin(@MessageBody() setAdminDto: SetAdminDto): Promise<ChatMember> {
    console.log('setAdminDto = ', setAdminDto);
    return await this.chatService.setAdmin(setAdminDto);
  }

  // @Roles('owner')
  @SubscribeMessage('giveOwnership')
  async changeOwnership(
    @MessageBody() giveOwnershipDto: DoubleUuidDto,
  ): Promise<Room> {
    return await this.chatService.giveOwnership(giveOwnershipDto);
  }

  // @Roles('owner')
  @SubscribeMessage('deleteRoom')
  async deleteRoom(@MessageBody() deleteRoomDto: UuidDto): Promise<Room> {
    return await this.chatService.deleteRoom(deleteRoomDto);
  }

  // @Roles('owner')
  // @UseGuards(ProtectedRoom)
  @SubscribeMessage('changePassword')
  async changePassword(
    @MessageBody() changePasswordDto: ChangePasswordDto,
  ): Promise<Room> {
    this.logger.debug('Change Password');
    console.log(changePasswordDto);
    return await this.chatService.changePassword(changePasswordDto);
  }

  // @Roles('admin')
  @SubscribeMessage('punishUser')
  async punishUser(
    @MessageBody() punishUserDto: PunishUserDto,
  ): Promise<ChatMember> {
    return await this.chatService.punishUser(punishUserDto);
  }

  // @Roles('admin')
  @SubscribeMessage('removePunishment')
  async removePunishment(
    @MessageBody() removePunishmentDto: RemovePunishmentDto,
  ): Promise<ChatMember> {
    console.log('removePunishmentDto = ', removePunishmentDto);
    return await this.chatService.removePunishment(removePunishmentDto);
  }

  @SubscribeMessage('findAllJoinedRooms')
  async findAllJoinedRooms(
    @Req() { user }: { user: user },
  ): Promise<ChatMember[]> {
    return await this.chatService.findAllJoinedRooms(user.userUuid);
  }

  @SubscribeMessage('findAllUsersInRoom')
  async findAllUsersInRoom(
    @MessageBody() roomId: UuidDto,
    @Req() { user }: { user: user },
  ) {
    return await this.chatService.findAllUsersInRoom(
      user.userUuid,
      roomId.uuid,
    );
  }

  @SubscribeMessage('findAllJoinableRooms')
  async findAllPublicOrProtectedRooms(
    @Req() { user }: { user: user },
  ): Promise<Room[]> {
    return await this.chatService.findAllJoinableRooms(user.userUuid);
  }

  @SubscribeMessage('findAllInvitableUsers')
  async findAllInvitableUsers(@MessageBody() roomId: UuidDto): Promise<user[]> {
    return await this.chatService.findAllInvitableUsers(roomId.uuid);
  }

  @SubscribeMessage('filterByAdminRightsInRoom')
  async findAdminsInRoom(
    @MessageBody() filterByAdminRightsDto: FilterByAdminRightsDto,
    @Req() { user }: { user: user },
  ): Promise<ChatMember[]> {
    return await this.chatService.filterByAdminRightsInRoom(
      filterByAdminRightsDto,
      user.userUuid,
    );
  }

  @SubscribeMessage('findBannedUsersInRoom')
  async findBannedUsersInRoom(
    @MessageBody() roomId: UuidDto,
  ): Promise<ChatMember[]> {
    return await this.chatService.findBannedUsersInRoom(roomId.uuid);
  }

  @SubscribeMessage('amIAdmin')
  async amIAdmin(
    @MessageBody() roomId: UuidDto,
    @Req() { user }: { user: user },
  ): Promise<boolean> {
    return await this.chatService.amIAdmin(user.userUuid, roomId.uuid);
  }

  @SubscribeMessage('amIOwner')
  async amIOwner(
    @MessageBody() roomId: UuidDto,
    @Req() { user }: { user: user },
  ): Promise<boolean> {
    return await this.chatService.amIOwner(user.userUuid, roomId.uuid);
  }

  @SubscribeMessage('findMutedUsersInRoom')
  async findMutedUsersInRoom(
    @MessageBody() roomId: UuidDto,
  ): Promise<ChatMember[]> {
    return await this.chatService.findMutedUsersInRoom(roomId.uuid);
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.debug(`client connected: ${client.id}`);
    const cookie: string = client.handshake.headers.cookie;
    if (cookie !== undefined &&
			cookie !== null
			&& cookie !== ""
			&& cookie.includes('access_token=')) {
			console.log("cookie", client.handshake.headers.cookie);
      const roomsToJoin: ChatMember[] = await this.chatService.handleConnection(
        client.handshake.headers.cookie,
      );
      for (const room of roomsToJoin) {
        this.server.socketsJoin(room.room.id);
      }
    }
  }

  handleDisconnect(client: Socket): void {
    const roomsToLeave: Set<string> = client.rooms;
    roomsToLeave.forEach((room) => {
      this.server.socketsLeave(room);
    });
  }
}
