import mongooseService from "../../common/services/mongoose.service";
import { CreateUserDto } from "../dto/create.user.dto";
import { PutUserDto } from "../dto/put.user.dto";
import { PatchUserDto } from "../dto/patch.user.dto";

import shortid from "shortid";
import debug from "debug";

const log: debug.IDebugger = debug("app:in-memory-dao");

class UsersDao {
    Schema = mongooseService.getMongoose().Schema;

    userSchema = new this.Schema(
        {
            _id: String,
            email: String,
            password: { type: String, select: false },
            firstName: String,
            lastName: String,
            permissionFlags: Number,
        },
        { id: false }
    );

    User = mongooseService.getMongoose().model("Users", this.userSchema);

    constructor() {
        log(`Created New instance of UsersDao`);
    }

    async addUser(userFields: CreateUserDto) {
        const userId = shortid.generate();
        const user = new this.User({
            _id: userId,
            ...userFields,
            permissionFlags: 1,
        });

        await user.save();
        return userId;
    }

    async getUserByEmail(email: string) {
        return this.User.findOne({ email: email }).exec();
    }

    async getUserById(userId: string) {
        return this.User.findOne({ _id: userId }).populate("User").exec();
    }

    async getUsers(limit = 25, page = 0) {
        return this.User.find()
            .limit(limit)
            .skip(limit * page)
            .exec();
    }

    async updateUserById(
        userId: string,
        userFields: PatchUserDto | PutUserDto
    ) {
        const existingUser = await this.User.findOneAndUpdate(
            { _id: userId },
            { $set: userFields },
            { new: true }
        ).exec();

        //The new: true option tells Mongoose to return the object,
        // as it is after the update,
        //rather than how it originally had been.
        return existingUser;
    }

    async removeUserById(userId: string) {
        return this.User.deleteOne({ _id: userId }).exec();
    }

    async getUserByEmailWithPassword(email: string) {
        return this.User.findOne({ email: email })
            .select(`_id email permissionFlags +password`)
            .exec();
    }
}

export default new UsersDao();
