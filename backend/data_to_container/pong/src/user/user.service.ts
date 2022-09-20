import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user } from 'src/bdd/users.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ChangeUserNameDto } from './dto/changeUserName.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { EndOfMatchDto } from './dto/endOfMatch.dto';
import { FindOrCreateUserDto } from './dto/findOrCreate.dto';
import { FlipTwoFactorAuthDto } from './dto/flipTwoFactorAuyh.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(user) private UserRepository: Repository<user>
    ) { }

    async getAllUser(): Promise<user[]> {
        //need to remove access_token from the tab
        return await this.UserRepository.find({ relations: { friends: true, blocked: true } });
    }

    async addFriend(user: user, userUuidToAdd: string): Promise<user[]> {
        const tofind = await this.getCompleteUser(userUuidToAdd);
        if (!tofind)
            return null;
        user.friends.push(tofind);
        await this.UserRepository.save(user);
        return user.friends;
    }

    async removeFriend(user: user, userUuidToRemove: string) {
        const tofind = await this.getUser(userUuidToRemove);
        const idx = user.friends.findIndex((object) => {
            return object.userUuid === tofind.userUuid;
        })
        if (idx > -1) {
            user.friends.splice(idx);
            await this.UserRepository.save(user);
            return user.friends;
        }
        return
    }

    async getUser(userUuid: string): Promise<user> {
        if (!userUuid)
            return null;
        const user = await this.UserRepository.findOne({ where: { userUuid: userUuid } });
        return user;
    }

    async getCompleteUser(userUuid: string): Promise<user> {
        if (!userUuid)
            return null;
        const user = await this.UserRepository.findOne({ relations: { friends: true, blocked: true, }, where: { userUuid: userUuid } });
        return user;
    }

    async FindOrCreateUser(userToFindOrCreate: FindOrCreateUserDto): Promise<user> {
        const user = await this.UserRepository.findOne({ where: { user42Id: userToFindOrCreate.user42Id } })
        if (user)
            return user;
        else {
            let numberToAdd: number = 1;
            let uniqueUserName: string = userToFindOrCreate.userName;
            while (numberToAdd < 60) {
                if (await this.UserRepository.findOne({ where: { userName: uniqueUserName } }))
                    numberToAdd++;
                else
                    break
                uniqueUserName = userToFindOrCreate.userName + numberToAdd;
            }

            return await this.UserRepository.save({
                userName: uniqueUserName,
                user42Id: userToFindOrCreate.user42Id,
                online: false,
                twoFactorAuth: false,
                wins: 0,
                losses: 0,
            });
        }
    }

    async changeUserName(userToChange: ChangeUserNameDto): Promise<void> {
        //need check if userName already exist

        if (await this.UserRepository.findOne({ where: { userName: userToChange.newName } })) {
            console.log("Error username already exist");
            return null;
        }
        await this.UserRepository.update(userToChange.userUuid, { userName: userToChange.newName });
    }

    async disableTwoFactorAuth(user: user): Promise<void> {
        await this.UserRepository.update(user.userUuid, { twoFactorAuth: false });
    }

    async enableTwoFactorAuth(user: user): Promise<void> {
        await this.UserRepository.update(user.userUuid, { twoFactorAuth: true });
    }

    async endOfMatch(players: EndOfMatchDto): Promise<void> {
        await this.UserRepository.increment({ userUuid: players.loserUuid }, "losses", 1)
        await this.UserRepository.increment({ userUuid: players.winnerUuid }, "wins", 1)
    }
}