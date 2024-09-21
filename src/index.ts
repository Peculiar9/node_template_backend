import { PORT, APP_NAME } from "./Core/appConfig";
import dotenv from "dotenv";
import App from "./App";
import { dbWatcherInitalize } from "./jobs/watcher.jobs";

// import { SubscriptionRepository } from './Core/Application/Repository/SubscriptionRepository';

dotenv.config();

const startApp = async () => {
  try {
    //Initialize Watcher

    const { waitlistWatcher } = await dbWatcherInitalize();

    const server = App.listen(PORT, async () => {
      if (
        process.env.ENVIRONMENT === "dev" ||
        process.env.ENVIRONMENT === "development"
      ) {
        console.log(
          `[server]: This app server => ${APP_NAME} is now listening on port http://localhost:${PORT}`
        );
      } else {
        console.log(
          `[server]: This app server => ${APP_NAME} is now listening on port ${PORT}`
        );
      }
    });

    //==============================================//
    //Don't touch unless you know what you are doing.//

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      // Close the server gracefully
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      // Close the server gracefully
      //Don't touch unless you know what you are doing.
      server.close(() => {
        process.exit(1);
      });
    });

    // Gracefully close MongoDB watchers on server close
    process.on("SIGINT", async () => {
      console.log("SIGINT signal received. Closing MongoDB watchers...");
      await Promise.all([waitlistWatcher.close()]);
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Error starting the application:", error);
  }
};
startApp().then(() => console.log("APP_START"));
