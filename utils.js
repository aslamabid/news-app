import bcrypt from 'bcrypt';

async function comparePassword(password, hash) {
    const res = await bcrypt.compare(password, hash);
    return res;
}

export { comparePassword }