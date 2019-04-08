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
const common_exceptions_1 = require("../../common/utils/common.exceptions");
const mailer_1 = require("../../common/mailer/mailer");
const user_loaders_1 = require("../../loaders/user.loaders");
class UserRepository {
    constructor() {
        this._loader = new user_loaders_1.UserLoader();
    }
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
            if (yield common_encryption_1.Encryption.compareHash(password, user.password)) {
                const token = yield common_jwt_1.JWT.generateToken(user._id.toHexString());
                const AuthToken = {
                    kind: common_constant_1.USER_TOKEN_KIND.session,
                    accessToken: token
                };
                user.tokens.push(AuthToken);
                // Save User
                const savedUser = yield user.save();
                return {
                    authToken: AuthToken,
                    user: savedUser.toJSON()
                };
            }
            else {
                throw Error("Failed to login, Invalid Password!");
            }
        });
    }
    /**
     * Register User
     * @param userPayload User input payload
     * @returns Object contains new created user and authentication token
     */
    register(userPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate unique parameters
            const isEmailAlreadyExists = yield user_validation_1.UserValidation.emailAlreadyExists(userPayload.email);
            if (isEmailAlreadyExists) {
                throw new common_exceptions_1.EmailAlreadyExists();
            }
            // Create User
            const user = new user_1.User({
                email: userPayload.email,
                password: userPayload.password,
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
                authToken: AuthToken,
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
            let user = yield this._loader.userById(userPayload.id);
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
            let user = yield this._loader.userById(userPayload.id);
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
     * @param _id ID of user
     */
    findOne(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._loader.userById(_id);
        });
    }
    /**
     * Get logged in user
     * @todo get by login user id
     */
    me(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._loader.userById(_id);
        });
    }
    oauthGoogle(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const googleUser = yield user_1.User.findOne({ google_id: profile.id });
                if (googleUser) {
                    mailer_1.sendMail(profile.emails[0].value, profile.displayName, `Welcome back ${profile.displayName} - Zujo`, 'login');
                    return yield this.generateAndSaveToken(googleUser);
                }
                else {
                    let user = new user_1.User({
                        google_id: profile.id,
                        email: profile.emails[0].value,
                        profile: {
                            name: profile.displayName,
                            picture: profile._json.picture
                        }
                    });
                    mailer_1.sendMail(profile.emails[0].value, profile.displayName, `Warm Welcome ${profile.displayName} - Zujo`, 'signup');
                    return yield this.generateAndSaveToken(user);
                }
            }
            catch (err) {
                throw new Error(err);
            }
        });
    }
    oauthFacebook(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fbUser = yield user_1.User.findOne({ facebook_id: profile.id });
                if (fbUser)
                    return yield this.generateAndSaveToken(fbUser);
                else {
                    let user = new user_1.User({
                        facebook_id: profile.id,
                        email: profile.emails[0].value,
                        profile: {
                            name: profile.displayName
                        }
                    });
                    return yield this.generateAndSaveToken(user);
                }
            }
            catch (err) {
                throw new Error(err);
            }
        });
    }
    generateAndSaveToken(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield common_jwt_1.JWT.generateToken(user._id.toHexString());
            const AuthToken = {
                kind: common_constant_1.USER_TOKEN_KIND.session,
                accessToken: token
            };
            user.tokens.push(AuthToken);
            const savedUser = yield user.save();
            return {
                authToken: AuthToken,
                user: savedUser.toJSON()
            };
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map