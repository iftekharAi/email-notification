
const functions =require("firebase-functions")
const admin = require("firebase-admin");
const cron = require('node-cron');
const emailjs= require("@emailjs/nodejs")

require("dotenv").config();

admin.initializeApp();




// Define a Firebase Cloud Function
exports.sendEmailToUsers = functions.pubsub
  .schedule('every day 12:00')
  .timeZone('Asia/Kolkata') // Set the london time zone
  .onRun(async (context) => {
    try {
      // Fetch the list of users from Firebase, assuming you have a 'users' collection
      const usersSnapshot = await admin.firestore().collection('vendors').get();
      const tempArray=new Set();
      
      const today = new Date();
     usersSnapshot.docs.forEach((doc)=>
     {
     
         if(doc.data().lastPromoAdded!==undefined  )
         {
          const lastActivity = doc.data().lastPromoAdded.toDate();
          const daysInactive = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
          if(daysInactive>10)
          {

            tempArray.add(doc.data().email)
          }
         }
     })
     let temp=Array.from(tempArray)
     if(temp.length>0)
     {
      await emailjs.send(
        process.env.EMAIL_JS_MY_EMAIL_S_ID,
        process.env.EMAIL_JS_MY_EMAIL_T_ID,
        {
          user_email:temp[0],
          bcc:temp.slice(1).length==0?"":temp.slice(1).join(",")
          // user_email:"rahilraj000@gmail.com",
          // bcc:"ansariiftekhar523@gmail.com,iftekar@aibender.co.in"
        },
        {
          publicKey: process.env.EMAIL_JS_MY_EMAIL_PB_KEY,
          privateKey: process.env.EMAIL_JS_MY_EMAIL_PV_KEY, // optional, highly recommended for security reasons
        },
      );
     
      console.log('SUCCESS!');
     }
     else{
      console.log("no data to send email")
    }
     
      
     
      return {"message":"all mails has been successfull sent!"};
    } catch (error) {
      console.error('Error sending emails:', error);
      return null;
    }
  });

// Schedule the function to run at 13:00 PM every day in the Indian time zone
// cron.schedule('0 18 * * *', () => {
//   const job = functions.pubsub.schedule('every 48 hours').timeZone('Asia/Kolkata').run();
// });




