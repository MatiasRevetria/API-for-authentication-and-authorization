import express  from 'express';
import fs, { write } from 'fs';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const users = ()=>{
    const info = fs.readFileSync('./dataBase.json');
    return JSON.parse(info);
};

const newUser = (info)=>{
    try{
        fs.writeFileSync("./dataBase.json",JSON.stringify(info));
    }catch(Error){
        console.log(Error);
    }
};

function admin(req,res,next){
    const auth = req.headers.authorization;
    if(auth == 'Admin'){
        next();
    }else{
        res.status(401);
        res.send('Access forbidden');
    }
}

function isAuth(req,res,next){
    const info = users();
    const auth = req.params.name
    const user = info.users.find((user)=> user.name === auth);

    if(user.position === "Admin"){
        req.users = info;
        next();
    }else{
        res.status(401);
        res.send('Access forbidden');
    }
};

app.get("/saludo/:name",(req,res)=>{
    const info = users();
    const name = req.params.name;
    const user = info.users.find((user)=> user.name === name);
    res.send('Hola '+user.name+'!');
})

app.get("/users/:name",isAuth,(req,res)=>{
    res.json(req.users);
});

app.get("/usuarios",(req,res)=>{
    const data = users();
    res.json(data.users);
});


app.post("/users/add",admin,(req,res)=>{
    const info = users();
    const body = req.body;
    const nUser = {
        id : info.users.length + 1,
        ...body,
    };
    info.users.push(nUser);
    newUser(info);      
    res.json(nUser);
});

app.put("/change/:name",(req,res)=>{
    const info = users();
    const body = req.body;
    const id = req.params.name;
    const userIndex = info.users.findIndex((user)=> user.name === id);
    info.users[userIndex] = {
        ...info.users[userIndex],
        ...body,
    };
    newUser(info);
    res.json('user update successfully');
});

app.delete("/kill/:id",admin,(req,res)=>{
    const info = users();
    const id = parseInt(req.params.id);
    const userIndex = info.users.findIndex((user)=> user.id === id);
    info.users.splice(userIndex,1);
    newUser(info);
    res.send('user deleted successfully');
});

app.listen(3000,()=>{
    console.log('Server listen on port 3000');
});