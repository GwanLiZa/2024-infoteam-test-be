import { Controller, Post, Body, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() userDto: UserDto) {
    const user = await this.authService.validateUser(userDto.email, userDto.password);
    if (!user) {
      throw new NotFoundException('User not found or incorrect password.');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() userDto: UserDto) {
    return this.authService.register(userDto);
  }
}
