const random=(min,max)=>{ return Math.floor(
    Math.random() * (max - min + 1) + min
  )};
const validarEmail=(email)=>{
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
}
const validarCampos=(email,password)=>{
    return email!=null && password!=null 
    && email!='' && password!='' ;
}
const largoPassword=(password)=>{
    return password.length > 6;
}

module.exports={random:random,
            validarEmail:validarEmail,
            validarCampos:validarCampos,
            largoPassword:largoPassword}
