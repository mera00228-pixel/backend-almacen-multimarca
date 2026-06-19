import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verificarToken=(req,res,next)=>{
 const auth=req.headers.authorization;
 if(!auth) return res.status(401).json({error:'Token no proporcionado'});
 try{
   const token=auth.split(' ')[1];
   req.usuario=jwt.verify(token,process.env.JWT_SECRET);
   next();
 }catch{
   res.status(401).json({error:'Token inválido'});
 }
};
