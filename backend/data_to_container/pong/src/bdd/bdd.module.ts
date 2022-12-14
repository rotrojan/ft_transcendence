import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMember } from './chat-member.entity';
import { typeOrmConfig } from './config/typeorm.config';
import { match } from './matchs.entity';
import { Message } from './message.entity';
import { Room } from './room.entity';
import { user } from './users.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      user,
      match,
      Message,
      Room,
      ChatMember,
  ]),
  ],
  exports: [TypeOrmModule],
})
export class BddModule {}
