import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { user } from 'src/bdd/users.entity';
import { ChangeUserNameDto } from './dto/changeUserName.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { EndOfMatchDto } from './dto/endOfMatch.dto';
import { FlipTwoFactorAuthDto } from './dto/flipTwoFactorAuyh.dto';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { FindOrCreateUserDto } from './dto/findOrCreate.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { FortyTwoStrategy } from 'src/auth/strategies/fortyTwo.strategy';
import { HandleFriendDto } from './dto/handleFriend.dto';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly UserService: UserService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Get me with acces_token' })
    @ApiResponse({ status: 200, description: 'Found user by uid', type: user })
    async getMe(@Req() req, @Res() res) {
        res.send(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('myFriends')
    async getMyFriends(@Req() req, @Res() res) {
        res.send(req.friends);
    }

    @UseGuards(JwtAuthGuard)
    @UsePipes(ValidationPipe)
    @Post('addFriend')
    async addFriend(@Req() req, @Res() res, @Body() userToHandle: HandleFriendDto) {
        res.send(this.UserService.addFriend(req.user, userToHandle.userUuidToHandle));
    }

    @UseGuards(JwtAuthGuard)
    @UsePipes(ValidationPipe)
    @Post('removeFriend')
    async removeFriend(@Req() req, @Res() res, @Body() userToHandle: HandleFriendDto) {
        res.send(this.UserService.removeFriend(req.user, userToHandle.userUuidToHandle));
    }

    // @UseGuards(JwtAuthGuard)
    @Get('all')
    @ApiOperation({ summary: 'Get all user of the table' })
    @ApiResponse({ status: 200, description: 'Found users', type: user })
    async getAllUser(): Promise<user[]> {
        return await this.UserService.getAllUser();
    }

    @Get('/:userUid')
    @ApiOperation({ summary: 'Get user by userUid' })
    @ApiResponse({ status: 200, description: 'Found user by uid', type: user })
    @UsePipes(ValidationPipe)
    async getUser(@Param('userUid') userUid: string): Promise<user> {
        return await this.UserService.getUser(userUid);
    }

     @Post('create')
     @ApiOperation({ summary: 'Create a new user' })
     @ApiParam({ name: 'CreateUserDto', type: CreateUserDto })
     @ApiResponse({ status: 200, description: 'The created user', type: user })
     @UsePipes(ValidationPipe)
     async createUser(@Body() UserToCreate : FindOrCreateUserDto) : Promise<user> {
     return await this.UserService.FindOrCreateUser(UserToCreate);
     }

    //ADD GUARDS!!!
    @Post('changeUsername')
    @ApiOperation({ summary: 'Change the username of the user' })
    @ApiParam({ name: 'ChangeUserNameDto', type: ChangeUserNameDto })
    @UsePipes(ValidationPipe)
    async changeUserName(@Body() userToChange: ChangeUserNameDto) {
        return await this.UserService.changeUserName(userToChange);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Enable two factor auth' })
    @Post('enableTwoFactorAuth')
    async enableTwoFactorAuth(@Req() req) {
        return await this.UserService.enableTwoFactorAuth(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Disable two factor auth' })
    @Post('disableTwoFactorAuth')
    async disableTwoFactorAuth(@Req() req) {
        return await this.UserService.disableTwoFactorAuth(req.user);
    }

    //ADD GUARDS!!!
    @Post('endOfMatch')
    @ApiOperation({ summary: 'Save score at the end of the match' })
    @ApiParam({ name: 'EndOfMatchDto', type: EndOfMatchDto })
    @UsePipes(ValidationPipe)
    async endOfMatch(@Body() players: EndOfMatchDto): Promise<void> {
        return await this.UserService.endOfMatch(players);
    }

}
