const { getUser } = require('../utils/auth');

const restrictToLogin = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    const token = bearerToken || req.cookies?.token || req.cookies.UUID

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = getUser(token);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }


    req.user = user;
    next();
};

module.exports = { restrictToLogin };