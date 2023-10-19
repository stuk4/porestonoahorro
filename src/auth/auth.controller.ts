import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';
import { CreateUserDto } from '../user-database/dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../user-database/entities/user.entity';
import { Auth } from './decorators';
import { Role } from './interfaces/auth.interfaces';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    registerUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Get('check-status')
    @Auth(Role.USER)
    checkAuthStatus(@GetUser() user: User) {
        return this.authService.checkAuthStatus(user);
    }
}
