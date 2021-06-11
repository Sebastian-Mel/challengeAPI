const api_key=process.env.API_KEY;

const fetch = require("node-fetch");
const random = require('../utils/utils');

const keywords={
    now_playing:'now_playing',
    popular:'popular',
    upcoming:'upcoming'
}

const checkKeyword=(keyword)=>{
    return  keyword == null || keyword==''||
            !keywords.hasOwnProperty(keyword);
}

const obtener_peliculas= (req,res)=>{
    var url=`https://api.themoviedb.org/3/movie/`
    keyword= req.query.keyword;
    
    if(checkKeyword(keyword)){
        const mensaje=`please write one of these keywords: now_playing,popular,upcoming`
        res.json(mensaje);
    }
    else{
        url= url + keyword + `?api_key=${api_key}&language=en-US`
        console.log(url);
        fetch(url)
        .then(res => res.json())
        .then(json => {  
        var listaPeliculas= json.results;
        
        listaPeliculas.forEach(function (pelicula) {
            pelicula.suggestionScore=random.random(0,99);
        });
        listaPeliculas.sort((b, a) => a.suggestionScore.toString().localeCompare(b.suggestionScore));
        return res.send(listaPeliculas);
        })
    }
};

module.exports ={obtener_peliculas: obtener_peliculas}