import jwt from 'jsonwebtoken'
import {Request, Response,} from 'express';
import config from '../config/config';

export const getUserInfo = (req: Request, res: Response) => {

    //check header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    //check token
    if (!token || !authHeader) return res.status(401).json({message: 'Access token not found'});


    jwt.verify(token, config.ACCESS_TOKEN_SECRET!, (err, user) => {

        if (err?.name === 'TokenExpiredError'){
            return res.status(401).json({message: 'Access token expired'});
        }

        if (err) return res.status(403).json({message: 'Invalid access token'});

       // console.log ('user:',user);
        return res.status(200).json({user: user});

    })

};
