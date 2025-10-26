import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	async findByEmail(email: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ email }).exec();
	}

	async create(data: { name: string; email: string; password: string }): Promise<UserDocument> {
		const existing = await this.findByEmail(data.email);
		if (existing) {
			throw new BadRequestException('User with this email already exists');
		}
		const created = new this.userModel(data);
		return created.save();
	}
}
