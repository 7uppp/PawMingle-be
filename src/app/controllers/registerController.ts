import {Response, Request} from 'express'
import dbConnection from '../../loader/dbConnect'
import {RowDataPacket} from 'mysql2'
import bcrypt from 'bcrypt'
import {validationResult} from "express-validator";

const SALT_ROUNDS = 10 //

export const register = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req); //

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        //get data from body
        const {email, username, password} = req.body
        //check if email, username, password is empty
        if (!email || !username || !password) {
            return res.status(400).json({
                message: 'Please provide all fields',
            })
        }
        //check if username already exists in database
        const checkUsernameCount = `SELECT COUNT(*) as count FROM userinfo WHERE username = ?`;
        dbConnection.query(
            checkUsernameCount,
            [username],
            async (err, results: RowDataPacket[]) => {
                if (err) {
                    return res.status(500).json({error: err});
                }

                const count = results[0].count;

                if (count > 0) {
                    return res.status(409).json({message: 'User already exists'});
                }
            }
        );
        //check if email already exists in database
        const checkEmailExist = `SELECT COUNT(*) as count FROM userinfo WHERE email = ?`
        dbConnection.query(
            checkEmailExist,
            [email],
            async (err, results: RowDataPacket[]) => {
                if (err) {
                    return res.status(500).json({error: err})
                }

                const count = results[0].count
                if (count > 0) {
                    return res.status(409).json({message: 'email already exists'});
                }

            }
        )

        //hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        //insert register's data into database
        const registerData = `INSERT INTO userinfo (email, username, password) VALUES (?, ?, ?)`
        dbConnection.query(
            registerData,
            [email, username, hashedPassword],
            (err, result: any) => {
                if (err) {
                    return res.status(500).json({error: err})
                }
                res.json({
                    message: 'Register success',
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                })
            }
        )
    } catch (error) {
        res.status(500).json({error})
    }
}
