const { User } = require('../Models/index');

const getAdminEmails = () => {
    return (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

exports.register = async (req, res) => {
    try {
        const { name, email, photoUrl } = req.body;
        if (!email || !name) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        let user = await User.findOne({ where: { email: email } });
        const isExistingUser = Boolean(user);
        const role = getAdminEmails().includes(email.toLowerCase()) ? 'admin' : 'user';

        if (!user) {
            user = await User.create({ name, email, photoUrl, role });
        } else {
            await user.update({ name, photoUrl, role });
        }

        return res.status(200).json({
            message: isExistingUser ? "Welcome Back" : "Account created",
            user
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}
