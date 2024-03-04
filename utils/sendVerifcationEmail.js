const nodemailer=require("nodemailer");

const sendEmail=(options)=>{
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
        subject:"Verify your Email",
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
  
module.exports=sendEmail;