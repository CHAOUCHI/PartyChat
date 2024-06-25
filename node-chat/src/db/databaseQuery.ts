// src/db.ts

import mysql from 'mysql2';
import {Sequelize } from 'sequelize'
import { DataType } from 'sequelize-typescript';

const login = {
    database: 'first-node-sql',
    username : 'root',
    password : ''
}

const sequelize = new Sequelize(login.database,login.username,login.password, {
    host: 'localhost',
    dialect: 'mysql'
})

sequelize.authenticate()
.then(()=>console.log("connect ok"))
.catch(error=>console.log(error));

const Users = sequelize.define("user", {
    id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataType.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataType.STRING,
        allowNull: false
    },
    password: {
        type: DataType.STRING,
        allowNull: false
    },
    role: {
        type: DataType.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    }
}, {
    tableName: 'users',
    timestamps: false
});


// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'first-node-sql'
// });

// connection.connect(err => { 
//     if (err) {
//         console.error('Error connecting to MySQL: ', err);
//         return;
//     }
//     console.log('Connected to MySQL successfully');
// });

export default sequelize
export { Users };