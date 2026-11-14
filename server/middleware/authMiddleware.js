const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {

        if (!req.session.userId) {
            return res.status(401).json({
                message: 'Not authenticated'
            });
        }

        const user = await User.findById(req.session.userId).select('username');

        if (!user) {
            return res.status(401).json({
                message: 'Not authenticated'
            });
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(500).json({
            message: 'Authentication error'
        });
    }
}

module.exports = authMiddleware;