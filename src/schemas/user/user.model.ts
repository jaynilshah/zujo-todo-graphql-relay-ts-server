import mongoose from "mongoose"
import crypto from "crypto"
import bcrypt from "bcrypt-nodejs";

import { comparePasswordFunction, UserModel } from "./user.typedef"

const userSchema = new mongoose.Schema({
        email: { type: String, unique: true },
        password: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
    
        facebook_id: String,
        twitter_id: String,
        google_id: String,
        tokens: Array,
    
        profile: {
            name: String,
            gender: String,
            location: String,
            website: String,
            picture: String
        }
    }, 
    { 
      timestamps: true,
      toJSON:{
        transform: (doc, ret) =>{
          delete ret._v
          delete ret.password
        }
      }
    }
);

/**
 * Password hash middleware.
 * @param next: Callback
 */
userSchema.pre("save", function(next) {
    const user =<UserModel> this;
    if (!user.isModified("password")) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
      if (err) { return next(err); }
      bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
        if (err) { return next(err); }
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
const comparePassword: comparePasswordFunction = (candidatePassword, cb)  => {
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
      cb(err, isMatch);
    });
};
userSchema.methods.comparePassword = comparePassword;

/**
 * Helper method for getting user's gravatar.
 * @param size: size of image
 */
userSchema.methods.gravatar = (size: number) => {
    if (!size) {
      size = 200;
    }

    if (!this.email) {
      return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash("md5").update(this.email).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model<UserModel>("User", userSchema);
export { User }