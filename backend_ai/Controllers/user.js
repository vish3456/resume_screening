const { User } = require('../Models/index');

exports.register = async (req, res) => {
    try {
        const { name, email, photoUrl } = req.body;
        const userExist = await User.findOne({ where: { email: email } });
        {/* Please watch the video for ful source code */ }

        return res.status(200).json({
            message: "Welcome Back",
            user: userExist
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}