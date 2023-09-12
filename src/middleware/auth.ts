import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).send('Unauthorized');

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).send('Invalid token');

        req.userId = decoded.id;
        next();
    });
};