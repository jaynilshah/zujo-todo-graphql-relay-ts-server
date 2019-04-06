"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_nodejs_1 = __importDefault(require("bcrypt-nodejs"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, unique: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    facebook: String,
    twitter: String,
    google: String,
    tokens: Array,
    profile: {
        name: String,
        gender: String,
        location: String,
        website: String,
        picture: String
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret._v;
            delete ret.password;
        }
    }
});
/**
 * Password hash middleware.
 * @param next: Callback
 */
userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt_nodejs_1.default.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt_nodejs_1.default.hash(user.password, salt, undefined, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});
/**
 *
 * @param candidatePassword : decrypted password
 * @param cb: callback function
 */
const comparePassword = (candidatePassword, cb) => {
    bcrypt_nodejs_1.default.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};
userSchema.methods.comparePassword = comparePassword;
/**
 * Helper method for getting user's gravatar.
 * @param size: size of image
 */
userSchema.methods.gravatar = (size) => {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto_1.default.createHash("md5").update(this.email).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
//# sourceMappingURL=user.model.js.map