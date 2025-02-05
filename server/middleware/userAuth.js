import jwt from 'jsonwebtoken';
const { verify } = jwt;

const userAuth = async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return res.json({
            success:false,
            message:"Not Authorised try again"
        })
    }
    try {
        
      const tokenDecode=  jwt.verify(token,process.env.JWT_SECRET);
      if (tokenDecode.id) {
        req.body.userId=tokenDecode.id;
      }
      else{
        res.json({
            success:false,
            message:"Not authorized Login Again"
        });
      }
      next();
    } catch (error) {
        res.json({
            success:false,
            message:error.message
        });
    }
}
export default userAuth;