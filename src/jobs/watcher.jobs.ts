import EmailService, { EmailData } from "../Core/Services/EmailService";
import { ChangeInstance, MongoDBWatcher } from "../Infrastructure/Events/MongoDBWatcher";
import UtilityService from "../Services/UtilityService";

export const dbWatcherInitalize = async () => {
     // Initialize MongoDB watchers for different collections
     // const userWatcher = new MongoDBWatcher('User');
     const waitlistWatcher = await sendEmailOnWaitlistSend();
     // await Promise.all([userWatcher.initialize(), waitlistWatcher.initialize()]);
     await Promise.all([waitlistWatcher.initialize()]);
     // return { userWatcher, waitlistWatcher };
     return { waitlistWatcher };
}

const sendEmailOnWaitlistSend = async () => {
     const waitlistWatcher = new MongoDBWatcher('Waitlist');
     waitlistWatcher.registerChangeCallback(async (change) => {
          console.log('Waitlist change detected:', change);
          if (change.operationType === 'insert') {
               console.log("OperationType => insert");
               console.log("=======================");
               const emailService = new EmailService();
               const emailData = constructEmailData(change);
               await emailService.sendWaitlistEmail(emailData as EmailData);
          }
     });
     return waitlistWatcher;
}

const constructEmailData = (changeData: ChangeInstance) => {
     if(!changeData) return;
     if(changeData.operationType === 'insert')
     {
          const emailData: EmailData = {
            recipient: changeData?.fullDocument?.email.toString(),
            firstName: changeData?.fullDocument?.firstName.toString(),
            guid: UtilityService.Guid(),
          };
          return emailData;
     }
     return;
     
}


