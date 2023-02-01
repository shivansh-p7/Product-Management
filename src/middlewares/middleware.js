const jwt = require("jsonwebtoken");

const Authentication = async (req, res,next) => {
    try {
        console.log(req.headers);
        let BearerToken = req.headers.authorization;
        if (!BearerToken) {
            return res
                .status(400)
                .json({ status: false, message: "token is missing" });
        }
        // 'Bearer ynrvhlfkl'
        let token = BearerToken.split(" ")[1];
        const decodedToken = jwt.verify(
            token,
            "project5-productManagement-group4"
        );
        if (!decodedToken) {
            return res
                .status(400)
                .json({ status: false, msg: "invalid token" });
        }
        req.decodedToken = decodedToken;
        next();
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

module.exports.Authentication = Authentication