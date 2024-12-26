const jwt = require("jsonwebtoken");
const User = require('../model/User');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'No authentication token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SEC);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
};

const verifyTokenAndCoordinator = async (req, res, next) => {
    try {
        await verifyToken(req, res, async () => {
            if (req.user.isCoordinator) {
                next();
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Coordinator privileges required.'
                });
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = {
    verifyToken,
    verifyTokenAndCoordinator
};
