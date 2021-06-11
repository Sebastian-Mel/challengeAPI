require('dotenv').config()
const fs= require("fs");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const utils=require('../utils/utils')


function buscarUsuario(lista,email){
    var usuario= lista.find(usuario=> usuario.email==email);
    return usuario;
}
const random=(min,max)=>{ return Math.floor(
    Math.random() * (max - min + 1) + min
  )};

const registrar_usuario=(req,res)=>{
    var respuesta;

    if(!utils.validarCampos(req.body.email,req.body.password)){
        respuesta={msg:"invalid fields",statusCode:400}
        return res.send(respuesta);
    }
    if(!utils.largoPassword(req.body.password)){
        respuesta={msg:"c´mn you can do better, let it grow to more that 6 digits",statusCode:400}
        return res.send(respuesta);
    }
    if(!utils.validarEmail(req.body.email)){
       respuesta ={msg:"that string pretending to be an email...",statusCode:400}
       return res.send(respuesta); 
    }
    fs.readFile('./src/db/usuarios.txt','utf-8',(err,data)=>{
        if(err){
            console.log(err);
            respuesta= {msg:"internal error",statusCode:500};
            return res.send(respuesta);
        }
        else{
            const usuariosjson= JSON.parse(data);
            const listaUsuarios=usuariosjson.usuarios;            
            var usuario= req.body;
            var existe= buscarUsuario(listaUsuarios,usuario.email)!=null? true:false;
            if(existe){
                respuesta= {msg:"user already exists",statusCode:409};
                return res.send(respuesta);
            }
            else{
                const saltRounds = 10;
                const hash = bcrypt.hashSync(usuario.password, saltRounds);
                usuario.password=hash;
                listaUsuarios.push(usuario);
                fs.writeFile("./src/db/usuarios.txt",JSON.stringify(usuariosjson,null,2),(err)=>{
                    if(err){console.log(err);}
                    else{
                        var usuariosFavs=JSON.parse(fs.readFileSync('./src/db/favoritos.txt','utf-8'));
                        var tupla={"email":usuario.email,"favoritos":[]}
                        usuariosFavs.usuarios.push(tupla);
                        fs.writeFileSync('./src/db/favoritos.txt',JSON.stringify(usuariosFavs,null,2));
                        respuesta= {msg:"success",statusCode:201};
                        return res.send(respuesta);
                        
                    }
                });
            }
                
        }
    });
};
const logout=(req,res)=>{

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    var invalidTokens=JSON.parse(fs.readFileSync('./src/db/invalidTokens.txt','utf-8'));
    var tokens=invalidTokens.tokens;
    tokens.push(token);
    fs.writeFileSync('./src/db/invalidTokens.txt',JSON.stringify(invalidTokens,null,2));
    res.json("Bye! I will miss you...srsly :( ");

}
const autenticar_usuario=(req,res)=>{
    var respuesta;
    fs.readFile('./src/db/usuarios.txt','utf-8',(err,data)=>{
        if(err){
            console.log(err);
            respuesta= {msg:"internal error,",statusCode:500};
            res.send(respuesta);
        }
        else{
            const usuariosjson= JSON.parse(data);
            const listaUsuarios=usuariosjson.usuarios;            
            var email= req.query.email;
            var usuario= buscarUsuario(listaUsuarios,email);
            if(usuario!=null){
                const accessToken=jwt.sign(usuario,process.env.ACCESS_TOKEN_SECRET);
                res.json({accessToken:accessToken});
            }
            else{
                respuesta= {msg:"invalid credentials",statusCode:401};
                res.send(respuesta);
            }
            
        }
    }
)};


const agregar_favoritos=(req,res)=>{
    
    const email= req.user.email;
    var respuesta;
    var usuariosFavs=JSON.parse(fs.readFileSync('./src/db/favoritos.txt','utf-8'));
    var usuarios= usuariosFavs.usuarios;
    const resultado = usuarios.find( usuario => usuario.email == email );
    var favoritos= resultado.favoritos;
    favoritos.push(req.body);
    const usuariosFavsTxt= JSON.stringify(usuariosFavs,null,2);
    fs.writeFile('./src/db/favoritos.txt',usuariosFavsTxt,(err)=>{
        if(err){
            console.log(err);
            respuesta= {msg:"internal error",statusCode:500};
            res.send(respuesta);
        }
        else{
            respuesta={msg:"added to favs",statusCode:201};
            res.send(respuesta);
        }
    });
};
const mis_favoritos= (req,res)=>{ 
    const email= req.user.email;
    var usuariosFavs=JSON.parse(fs.readFileSync('./src/db/favoritos.txt','utf-8'));
    var usuarios= usuariosFavs.usuarios;
    const resultado = usuarios.find( usuario => usuario.email == email );
    var favoritos= resultado.favoritos;
    favoritos.forEach(function (pelicula) {
        pelicula.suggestionForTodayScore=random(0,99);
    });
    favoritos.sort((b, a) => a.suggestionForTodayScore.toString().localeCompare(b.suggestionForTodayScore));
    return res.send(favoritos);           
};
module.exports={registrar_usuario:registrar_usuario,
                autenticar_usuario:autenticar_usuario,
                logout:logout,
                agregar_favoritos:agregar_favoritos,
                mis_favoritos:mis_favoritos}
