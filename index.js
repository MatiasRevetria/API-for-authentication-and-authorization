import express  from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const routerUsers = express.Router();
app.use('/api/users',routerUsers);

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

routerUsers.get("/saludo/:name",(req,res)=>{
    const info = users();
    const name = req.params.name;
    const user = info.users.find((user)=> user.name === name);
    res.send('Hola '+user.name+'!');
})

routerUsers.get("/:name",isAuth,(req,res)=>{
    res.json(req.users);
});

app.get("/api/usuarios",(req,res)=>{
    const data = users();
    res.json(data.users);
});

routerUsers.get('/usuario/:position',(req,res)=>{
    const info = users();
    const usu = req.params.position;
    const results = info.users.filter((user) => user.position === usu); 
    
    if(results.length == 0){
        res.status(404).send('No se encontro ningun usuario');
    }

    if(req.query.ordenar === 'id'){
        return res.send(JSON.stringify(results.sort((a,b)=> a.id - b.id)));
    }

    res.send(JSON.stringify(results));

});


routerUsers.post("/add",admin,(req,res)=>{
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

app.put("/api/change/:name",(req,res)=>{
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

app.delete("/api/kill/:id",admin,(req,res)=>{
    const info = users();
    const id = parseInt(req.params.id);
    const userIndex = info.users.findIndex((user)=> user.id === id);
    info.users.splice(userIndex,1);
    newUser(info);
    res.send('user deleted successfully');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server listen on port ${PORT}...`);
});