// importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from 'pusher';
import Cors from 'cors';
// app config
const app = express();
const port = process.env.PORT || 9000

// Connected using = Access your data through tools --> MongoDB compass
const connUrl = 'mongodb+srv://sanjay:sanjaykdg@whatsapp.z0yl07u.mongodb.net/whatsapp-backend';



const pusher = new Pusher({
    appId: "1488314",
    key: "01788493743d48fba40f",
    secret: "b2eb30666b607fc8fdcd",
    cluster: "ap1",
    useTLS: true
  });

// middlewares
app.use(express.json());
app.use(Cors());


// db config
 mongoose.connect(connUrl);


const db = mongoose.connection;
db.once('open', ()=>{
    console.log("Db is connected");

    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch(); 
    

    changeStream.on('change', (change)=>{
        console.log('A change occured', change)
        
        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',{
                name : messageDetails.name,
                message : messageDetails.message,
                timestamp: messageDetails.timestamp,
                received:messageDetails.received,
            })
        }else{
            console.log("Error triggering pusher")
        }
    })

})  


// Api routes
app.get('/', (req, res)=>{
    res.status(200).send('hello world');
})

app.get('/messages/sync', (req, res)=>{
    Messages.find((err, data)=>{
        if(err){
            res.status(500).send(err)
        } else{
            res.status(200).send(data)
        }
    })
})
app.post('/messages/new', (req, res)=>{
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data)=>{
        if(err){
            res.status(500).send(err)
        } else{
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})

// listeners
app.listen(port, ()=>{
    console.log(`Listening on localhost:${port}`)
})


// 11;09
// sanjaykdg