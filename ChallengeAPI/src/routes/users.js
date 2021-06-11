require('dotenv').config()
const express= require('express');
const fs= require('fs');
const router=express.Router();
const usersController=require('../controllers/usersController');
const moviesController=require('../controllers/moviesController');
const jwt = require('jsonwebtoken');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

function authenticateToken(req, res, next) {
    
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null){ 
        return res.sendStatus(401)
    }
    var invalidTokens=JSON.parse( fs.readFileSync('./src/db/invalidTokens.txt','utf-8'));
    if(invalidTokens.tokens.includes(token)){
        return res.json({msg:"expired token",statusCode:401});
    };
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
      req.user = user
      next()
    })
}


router.post('/api/usuarios/registrar',usersController.registrar_usuario);
router.post('/api/usuarios/autenticar',usersController.autenticar_usuario);
router.post('/api/usuarios/logout',authenticateToken,usersController.logout);
router.post('/api/usuarios/agregarFavoritos',authenticateToken,usersController.agregar_favoritos);
router.get('/api/usuarios/misFavoritos',authenticateToken,usersController.mis_favoritos);
router.get('/api/movies/obtenerPeliculas',authenticateToken,moviesController.obtener_peliculas);





module.exports = router;