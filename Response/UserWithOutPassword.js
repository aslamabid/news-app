class UserWithOutPassword {
  constructor(user) {
    this._id = user._id;
    this.email = user.email
    this.createdAt = user.createdAt;
  }

  _id;
  email
  createdAt;
}

export default UserWithOutPassword;
