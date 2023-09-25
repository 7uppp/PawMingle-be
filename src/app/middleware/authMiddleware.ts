import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;


interface RequestWithUserId extends Request {
    userId?: string;
}

const authMiddleware = async (req: RequestWithUserId, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const authType = authHeader?.split(' ')[0];
    const authToken = authHeader?.split(' ')[1];

    if (!authHeader || !authToken) return res.status(401).send('invalid authHeader or authToken');

    if (authType === 'Bearer') {
        jwt.verify(authToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
                //check is authToken expired
                if (err && err.name === 'TokenExpiredError') return res.status(401).send('token expired');
                //check if authToken is valid
                if (err) return res.status(401).send('invalid access token');
                next();
            }
        );
    } else {
        return res.status(401).send('invalid authType');
    }

};
export default authMiddleware;

