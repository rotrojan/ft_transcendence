import { ConsoleLogger, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { UserService } from "src/user/user.service";

@Injectable()
//used when @useGuard(FortyTwoAuthGard)
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.REACT_APP_CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.REACT_APP_REDIRECT_URI,
      // profileFields: {
        // 'id': 'id',
        // 'username': 'login'
      // }
      //verify function
    }, async (access_token, refreshToken, profile, done) => {
    //fuction received acces token from 42 api and create or find user in database

      console.log("[FortyTwoStrategy] - Find or create user :", profile.id)
      const user = await userService.FindOrCreateUser({'userName': profile.username, 'user42Id': profile.id, 'accessToken42': access_token});
      if (!user)
      {
        //needToThrow
        console.log("[FortyTwoStrategy] - Error during creation / finding");
        return done("[FortyTwoStrategy] - Error during creation / finding");
      }
      else
      {
        console.log("[FortyTwoStrategy] - ", user.userName, "created/found")
        return done(null, user);
      }
    });
  }
}