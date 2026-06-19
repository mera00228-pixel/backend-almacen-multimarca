import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const login=(req,res)=>{
 const {usuario, contraseña}=req.body;
 if(usuario!=='admin' || contraseña!=='1234'){
   return res.status(401).json({error:'Credenciales incorrectas'});
 }
 const token=jwt.sign({usuario},process.env.JWT_SECRET,{expiresIn:'2h'});
 res.json({token});
};
