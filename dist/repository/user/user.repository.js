"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const user_validation_1 = require("./user.validation");
const common_encryption_1 = require("../../common/utils/common.encryption");
const common_jwt_1 = require("../../common/utils/common.jwt");
const user_1 = require("../../schemas/user");
const common_constant_1 = require("../../common/utils/common.constant");
const utils_1 = require("../../schemas/utils");
class UserRepository {
    constructor() { }
    /**
     * Login user with credentials
     * @param email email address of user
     * @param password password of user
     */
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user
            const where = {
                email: email
            };
            let user = yield user_1.User.findOne(where);
            if (!user) {
                throw new Error("User not found!");
            }
            if (common_encryption_1.Encryption.compareHash(password, user.password)) {
                const token = yield common_jwt_1.JWT.generateToken(user._id.toHexString());
                const AuthToken = {
                    kind: common_constant_1.USER_TOKEN_KIND.session,
                    accessToken: token
                };
                user.tokens.push(AuthToken);
                // Save User
                const savedUser = yield user.save();
                return {
                    accessToken: AuthToken,
                    user: savedUser.toJSON()
                };
            }
            else {
                throw Error("Failed to login, Invalid Password!");
            }
        });
    }
    /**
     * Create User
     * @param userPayload User input payload
     * @returns Object contains new created user and authentication token
     */
    create(userPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate unique parameters
            const isEmailAlreadyExists = yield user_validation_1.UserValidation.emailAlreadyExists(userPayload.email);
            if (isEmailAlreadyExists) {
                throw new Error("User with same email address already exists!");
            }
            // Encrypt password
            const hashedPassword = yield common_encryption_1.Encryption.encrypt(userPayload.password);
            // Create User
            const user = new user_1.User({
                email: userPayload.email,
                password: hashedPassword,
                profile: {
                    name: userPayload.profile.name,
                    gender: userPayload.profile.gender,
                    location: userPayload.profile.location,
                    website: userPayload.profile.website,
                    picture: userPayload.profile.picture,
                }
            });
            // Generate and assign token to created user
            const token = yield common_jwt_1.JWT.generateToken(user._id.toHexString());
            const AuthToken = {
                kind: common_constant_1.USER_TOKEN_KIND.session,
                accessToken: token
            };
            user.tokens.push(AuthToken);
            // Save User
            const savedUser = yield user.save();
            return {
                accessToken: AuthToken,
                user: savedUser.toJSON()
            };
        });
    }
    /**
     * Update User
     * @param where condition to update
     * @param userPayload : User input payload
     */
    update(userPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            // convert id to ObjectID
            userPayload.id = utils_1.convertToObjectId(userPayload.id);
            // Validate user by specified User Id
            const isEmailAlreadyExistsExceptId = yield user_validation_1.UserValidation.emailAlreadyExistsExceptId(userPayload.id, userPayload.email);
            if (isEmailAlreadyExistsExceptId) {
                throw new Error("User with same email address already exists!");
            }
            // Find user
            const where = {
                _id: userPayload.id
            };
            let user = yield user_1.User.findOne(where);
            if (!user) {
                throw new Error("User not found!");
            }
            // Update user
            userPayload = lodash_1.default.merge(user, userPayload);
            const result = yield user_1.User.updateOne(where, userPayload);
            if (result && result.ok) {
                return userPayload;
            }
            else {
                throw Error("Failed to update user, Please try again!");
            }
        });
    }
    /**
     * Delete user by id
     * @param userPayload user payload with id
     */
    delete(userPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user
            const where = {
                _id: userPayload.id
            };
            let user = yield user_1.User.findOne(where);
            if (!user) {
                throw new Error("User not found!");
            }
            // Delete user
            yield user_1.User.deleteOne(where);
            return user;
        });
    }
    /**
     * Find one record
     * @param id ID of user
     */
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user
            const where = {
                _id: id
            };
            let user = yield user_1.User.findOne(where);
            if (!user) {
                throw new Error("User not found!");
            }
            return user;
        });
    }
    /**
     * Get logged in user
     * @todo get by login user id
     */
    me() {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield user_1.User.findOne({ _id: "5c8f75aee599af0235063997" });
            if (!user) {
                throw new Error("User not found!");
            }
            return user;
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map