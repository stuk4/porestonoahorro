import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';
import { CreateUserDto } from '../user-database/dto';

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
}
