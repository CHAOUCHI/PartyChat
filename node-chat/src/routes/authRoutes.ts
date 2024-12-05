import express, { Request, response, Response } from 'express';
import jwt from 'jsonwebtoken';
import sequelize from '../db/databaseQuery'
import { Users } from '../db/databaseQuery';
import { Payload } from '../interface/Payload';


const router = express.Router();
const secret = 'secret-for-jwt';

router.get('/', (req : Request, res: Response)=> {
    return res.json({msg : "server working"})
})

router.post('/login', async (req: Request, res: Response) => {

    console.log(req.body)

    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ where: { email } });

        console.log(user)

        if (!user) {
            console.log('someone not know tried to log')
            return res.status(404).json({ msg: 'User not found' });
        }

        if (password !== user.dataValues.password) {
            console.log('not password correct trying to log')
            return res.status(401).json({ msg: 'Invalid password' });
        }

        const payload : Payload = { name: user.dataValues.name, role: user.dataValues.role};
        const newToken = jwt.sign(payload, secret);

        res.cookie('token', newToken, { httpOnly: true });
        console.log('someone loged')
        return res.json({ msg: 'Login successful' , name:  user.dataValues.name});
    } catch (error) {
        console.error('Error during login:', error);
        // const body : ApiBody = {
        //     msg : 'Server error',
        //     data : null
        // }
        // res.status(500).json(body);
    }
});

router.get('/product', checkJwt, (req: Request, res: Response) => {
    res.status(200).json({ content: 'some content' });
});

router.get('/users',checkJwt ,async (req: Request, res: Response) => {
    try {
        const users = await Users.findAll();
        res.json(users);
    } catch (error) {
        console.error('not found', error);
        res.status(500).json({ error: 'not found' });
    }
});

function checkJwt(req: Request, res: Response, next: Function) {
    const token = req.cookies.token;

    jwt.verify(token, secret, (err: any, decodedToken: any) => {
        if (err) {
            return res.status(401).json('Unauthorized, wrong token');
        }
        switch (decodedToken.role) {
            case 'admin':
                next();
                break;
            default:
                res.status(401).json({ msg: `not authorized user` });
                break;
        }
    });
}

export default router;
