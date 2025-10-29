import { Controller, Post, Body, UsePipes, ValidationPipe, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('signup')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async signup(@Body() body: SignupDto) {
		return this.authService.signup(body);
	}

	@Post('login')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async login(@Body() body: LoginDto) {
		const { email, password } = body;
		return this.authService.login(email, password);
	}

	@Get('validate')
	@UseGuards(JwtAuthGuard)
	async validateToken() {
		return { valid: true, message: 'Token is valid' };
	}
}
