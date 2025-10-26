import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService, private jwtService: JwtService) {}

	private signToken(payload: object) {
		return this.jwtService.sign(payload);
	}

	async signup(data: { name: string; email: string; password: string }) {
		const existing = await this.usersService.findByEmail(data.email);
		if (existing) {
			throw new BadRequestException('User already exists');
		}

		const saltRounds = 10;
		const hashed = await bcrypt.hash(data.password, saltRounds);

		const user = await this.usersService.create({ ...data, password: hashed });

		const token = this.signToken({ sub: (user as any)._id.toString(), email: user.email });
		return { message: 'Signup successful', token };
	}

	async login(email: string, password: string) {
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const token = this.signToken({ sub: (user as any)._id.toString(), email: user.email });
		return { message: 'Login successful', token };
	}
}
