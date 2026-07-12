const { getUser } = require("../utils/auth");

const restrictToLogin = (req, res, next) => {
    console.log("========== AUTH ==========");
    console.log("Cookies:", req.cookies);
    console.log("Cookie Header:", req.headers.cookie);

    const token = req.cookies?.token || req.cookies?.UUID;

    console.log("Token:", token);

    if (!token) {
        console.log("❌ No token found");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = getUser(token);

    if (!user) {
        console.log("❌ Invalid token");
        return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("✅ User:", user);

    req.user = user;
    next();
};

module.exports = { restrictToLogin };