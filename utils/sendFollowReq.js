const nodemailer=require("nodemailer");

const sendFollowRequest=(options)=>{
  return new Promise((resolve, reject) => {
   const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "93830a429b503a",
          pass: "10c530f2c9fbc9"
        }
      });
      const emailOptions={
        from:"zubair@support.com",
        to:options.email,
        subject:"Follow Request",
        text:options.message
      }
      transport.sendMail(emailOptions, (error, info) => {
        if (error) {
          reject(error); 
        } else {
          resolve(info); 
        }
      });
    });
  };
  
module.exports=sendFollowRequest;