require('dotenv').config();

const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createSigner, createVerifier } = require('fast-jwt');
const orm = require('orm');
const axios = require('axios');

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});
const ETHERPAD_APIKEY = 'UcCGa6fPpkLflvPVBysOKs9eeuWV08Ul';
const etherpad_api = require('etherpad-lite-client');
const etherpad = etherpad_api.connect({
    apikey: ETHERPAD_APIKEY,
    host: 'localhost',
    port: 9001,
})

const SERVER_PORT = 8001;

app.use(cors());
app.use(express.json());

const clientRoutes = {
    HOST: 'http://localhost',
    HOST_PORT: 8001,
    home: '/',
    getUserInfo: '/api/get-user',
    updateUserInfo: '/api/update-user',
    deleteUserInfo: '/api/delete-user',
    getRooms: '/api/get-rooms',
    createRoom: '/api/create-room',
    joinRoom: '/api/join-room',
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    janusConnect: '/janus/connect',
    janusAttachVideo: '/janus/attach-video',
    janusPostJsep: '/janus/post-jsep',
    janusCreateRoom: '/janus/create-room'
};

let janusRoutes = {
    HOST: 'http://192.168.0.13',
    httpPORT: ':8088',
    socketPORT: ':8188',
    home: '/janus',
    sessionID: '',
    pluginID: '', // videoroom plugin
    roomID: -1,
    jsep: null
}

const db = orm.connect({
    host:     'localhost',
    database: 'webrtc-connect',
    user:     'postgres',
    password: 'From2006',
    protocol: 'pg',
    port:     '5432',
    query:    {pool: true, debug: true}
});

let UserTable; // db table
let RoomTable; // db table

db.on('connect', (err) => {
    if (err) return console.error('Connection error: ' + err);
    console.log('connected to db successfully');

    RoomTable = db.define("room", {
        roomid: {type: "integer"},
        description: String,
        publishers: {type: "integer"},
        pin: String,
        interactive: Boolean,
        ownerEmail: String,
        isPrivateRoom: Boolean,
        secret: String
    });
    UserTable = db.define("user", {
        rules: String,
        email: String,
        password: String,
        nickname: String,
        currentRoomID: {type: "integer"},
        currentSocketID: String
    });

    db.sync(err => {
        if (err) throw err;

        UserTable.find({
            nickname: 'God Almighty'
        }, (err, users) => {
            console.log('65. user found: ', users[0].email)
        });

        RoomTable.find({roomid: 1234}, (err,rooms) => {
            if (err) throw err;
            console.log('70. room found: ', rooms[0].roomid);/*
            rooms[0].users = null;
            rooms[0].save(err =>{})*/
        });
        /*RoomTable.find({ roomid: 123 }).remove(function (err) {
            if (err) throw err;
        });*/
    });

});

let local_db = {
    users: [],
    connections: []
};

// --------------------------- SOCKET FUNCTIONALITY -------------------------
io.sockets.on('connection', (socket)=>{
    local_db.connections.push(socket);
    console.log('socket connected');

    socket.on('send message', ({roomid, message}) => { // message: {nickname, time, value}
        console.log(`user ${message.nickname} send message in room ${roomid}`);
        io.to(roomid).emit('add message', {message: message})
    })

    socket.on('send draw', ({roomid, drawing})=>{
        console.log(`draw received from user ${drawing.nickname}`);
        io.to(roomid).emit('add draw', {drawing: drawing})
    })

    socket.on('join room', ({roomid, userInfo}) => { //{roomid, nickname}
        console.log(`user ${userInfo.nickname} joined room ${roomid}`);

        UserTable.find({email: userInfo.email}, (err, dbUsers) => {
            dbUsers[0].currentRoomID = roomid;
            dbUsers[0].currentSocketID = socket.id;
            dbUsers[0].save(err => {
                if(err)throw err;

                socket.join(roomid);
                io.to(roomid).emit('add message', {
                    message: {
                        nickname: 'Chat Bot',
                        time: '',
                        value: `User ${userInfo.nickname} joined chat`
                    }
                });

                UserTable.find({currentRoomID: roomid}, (err, dbUsers)=>{
                    io.to(roomid).emit('room users check', { roomid: roomid, users: dbUsers})
                })
            })
        })
    });

    socket.on('leave room', ({roomid, userInfo, userID}) => { //{roomid, nickname}
        console.log(`user ${userInfo.nickname} left room ${roomid}`);
        io.to(roomid).emit('add message', {
            message: {
                nickname: 'Chat Bot',
                time: '',
                value: `User ${userInfo.nickname} left chat`
            }
        });
        UserTable.find({email: userInfo.email}, (err, dbUsers) => {
            dbUsers[0].currentRoomID = null;
            dbUsers[0].save(err => {
                if(err)throw err;

                UserTable.find({currentRoomID: roomid}, (err, dbUsers)=>{
                    io.to(roomid).emit('room users check', { roomid: roomid, users: dbUsers})
                    socket.leave(roomid);
                })
            })
        })
    });

    socket.on('disconnect', (data)=>{
        console.log('socket disconnected');
        local_db.connections.splice(local_db.connections.indexOf((socket), 1));

        UserTable.find({currentSocketID: socket.id}, (err, dbUsers0) => {
            const discUser = dbUsers0[0];
            if(discUser && discUser.currentRoomID) {
                const roomid = discUser.currentRoomID;
                discUser.currentRoomID = null;
                discUser.save(err => {
                    if (err) throw err;

                    UserTable.find({currentRoomID: roomid}, (err, dbUsers) => {
                        io.to(roomid).emit('room users check', {roomid: roomid, users: dbUsers})
                        socket.leave(roomid);
                        console.log('socket disconnected successfully');
                    })
                })
            }

        })

    });
})


// --------------------------- TOKEN CHECK --------------------------------
const checkToken = (request, response, next) => {
    console.log('token Check')
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token: ', token);

    if(token === undefined){ response.status(401).send(); return;}

    // Callback style with complete return
    const verifySync = createVerifier({ key: process.env.ACCESS_TOKEN_SECRET });

    try{
        const payload = verifySync(token)
        console.log('136 ', payload)
        request.user = payload;
        next();
    }catch(err){
        console.log(err)
        return response.status(401).send(err);
    }

};


// --------------------------- SERVER API ---------------------------------
// --------------------------- ROOMS --------------------------------------
app.get('/', function (req, res) {
    res.send('8001. Authorisation service');
});

// get rooms check
app.get(clientRoutes.getRooms, checkToken,(req, res) => {
    console.log('get rooms')
    // req.user - can use for filter
    RoomTable.find({}, (err, dbRooms) => {
        if(err){
            res.status(400).send();
            throw err;
        }

        res.status(200).send({
            rooms: dbRooms,
            message: 'all rooms found'
        })

        //TODO
        //console.log(etherpad)
        /*etherpad.createGroup(function(error, data) {
            if(error) console.error('Error creating group: ' + error.message)
            else console.log('New group created: ' + data.groupID)
        })*/
    });
});

// create room
app.post(clientRoutes.createRoom, checkToken,(req, res) => {
    console.log('create room');
    console.log(req.body.room);
    console.log(req.user);
    const room = req.body.room;
    let roomFound = undefined;

    RoomTable.find({roomid: room.roomid}, (err, dbRooms) => {
        if(err) throw err;
        console.log(room)
        roomFound = dbRooms[0];
        if(roomFound){
            // room with
            console.log('room with that id already exists');
            res.status(401).send();
            return;
        }

        RoomTable.create({
            roomid: room.roomid,
            description: room.description,
            secret: room.secret,
            publishers: room.publishers,
            pin: room.pin,
            interactive: room.interactive,
            ownerEmail: room.ownerEmail,
            isPrivateRoom: room.isPrivateRoom
        }, err => {
            if(err) {
                res.status(401).send();
                throw err;
            }
            console.log('room successfully created')
            res.status(200).send({
                message: 'room successfully created',
            });
        });
    });
})
// join room in socket

// --------------------------- USERS --------------------------------------
app.get(clientRoutes.getUserInfo, checkToken, (req, res) => {
    console.log(req.user);
    if(req.user && req.user.email){
        UserTable.find({email: req.user.email}, (err, dbUsers) => {
            if (err) throw err;

            if(dbUsers[0]){
                res.status(200). send({
                    user: {
                        email: dbUsers[0].email,
                        password: dbUsers[0].password,
                        nickname: dbUsers[0].nickname,
                        rules: dbUsers[0].rules,
                    }
                })
            }
        })
    } else {
        res.status(403).send();
    }
})

app.post(clientRoutes.updateUserInfo, checkToken, (req, res) => {
    console.log('update user info')
    console.log(req.body);
    if(req.user && req.user.email){
        UserTable.find({email: req.user.email}, (err, dbUsers) => {
            if (err) throw err;

            if(dbUsers[0]){
                // пришёл админский запрос, меняем(обновляем) все поля
                if(req.body.rules){

                } else if(req.body.password) {// пользовательский запрос только на пароль
                    dbUsers[0].password = req.body.password;
                    dbUsers[0].save(err=>{if(err)throw err;})
                } else if(req.body.nickname){
                    dbUsers[0].nickname = req.body.nickname;
                    dbUsers[0].save(err=>{if(err)throw err;})
                }

                res.status(200). send({
                    user: {
                        email: dbUsers[0].email,
                        password: dbUsers[0].password,
                        nickname: dbUsers[0].nickname,
                        rules: dbUsers[0].rules,
                    }
                })
            }
        })
    } else {
        res.status(403).send();
    }

})

app.delete(clientRoutes.deleteUserInfo, checkToken, (req, res) => {

})


// --------------------------------- AUTHORIZATION ------------------------------
// login
app.post(clientRoutes.login, (req, res) => {
    const logUser = {
        email: req.body.email,
        password: req.body.password
    }
    console.log('user logged');
    console.log(logUser);

    UserTable.find({ email: logUser.email }, (err, users) => {
        const user = users[0];

        if(user && user.password === logUser.password){
            const payload = {
                email: user.email,
                nickname: user.nickname
            };

            const signSync = createSigner({ key: process.env.ACCESS_TOKEN_SECRET })
            const accessToken = signSync(payload);
            //create token with user info
            //const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            // all we need - token, cause contains info about user
            res.status(200).send({
                accessToken: accessToken
            });
        }
        res.status(403).send();
    });
})

// register
app.post(clientRoutes.register, (req, res) => {
    //register
    const regUser = {
        email: req.body.email,
        password: req.body.password,
        nickname: req.body.email.split('@')[0],
        rules: 'user'
    }
    console.log(regUser);
    UserTable.find({ email: regUser.email }, (err, users) => {
        if(users.length > 0){
            res.status(400).send('user already exists');
            return;
        }

        UserTable.create(regUser, err => {
            if(err) throw err;

            const payload = {
                email: regUser.email,
                nickname: regUser.nickname
            };
            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
            res.status(200).send({
                accessToken: accessToken
            });
        });
    });
});

// log out
app.delete(clientRoutes.logout, (req,res) => {
    res.status(204).send('tokens refreshed')
});


// --------------------------- JANUS API ------------------------------
// connect to Janus
app.get(clientRoutes.janusConnect, (req, res) => {
    console.log('connect to Janus')
    const jr = janusRoutes;

    axios.post(jr.HOST+jr.httpPORT+jr.home, {
        "janus" : "create",
        "transaction" : ""
    })
        .then(res => {
            console.log('got sessionID')
            jr.sessionID = '/'+res.data.data.id;
        })
        .catch(err => {console.log(err)});

    res.status(200).send('connected to janus');
});

// attach plugin to Janus session
app.post(clientRoutes.janusAttachVideo, (req, res) => {
    console.log('attach videoroom to Janus')
    const jr = janusRoutes;

    axios.post(jr.HOST+jr.httpPORT+jr.home+jr.sessionID, {
        "janus" : "attach",
        "transaction" : "",
        "plugin" : "janus.plugin.videoroom"
    })
        .then(res => {
            jr.pluginID = '/'+res.data.data.id;
            console.log('got pluginID');
        })
        .catch(err => {console.log(err)});

    res.status(200).send('videoroom plugin attached');
});

// get jsep
app.post(clientRoutes.janusPostJsep, (req, res) => {

    janusRoutes.jsep = req.body.offerSdp;
    console.log(janusRoutes.jsep.type);

    res.status(200).send('jsep got');
});

// create janus videoroom
app.post(clientRoutes.janusCreateRoom, (req, res) => {
    console.log('create janus videoroom')
    const jr = janusRoutes;


    // 'Missing mandatory element (transaction)'
    axios.post(jr.HOST+jr.httpPORT+jr.home+jr.sessionID+jr.pluginID, {
        "request" : "create",
        "room" : jr.roomID,
        "permanent" : false,
        "description" : "creating test room",
        "is_private" : false
    })
        .then(response => {
            console.log(res);
            if(response.data.error){
                res.status(400).send();
            }
            res.status(200).send('videoroom plugin attached');
        })
        .catch(err => {
            console.log(err)
        });


});

server.listen(SERVER_PORT, () => console.log(`server running on port ${SERVER_PORT}`))