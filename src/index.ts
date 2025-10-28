import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  
  await app.listen(process.env.PORT || 3000);
  console.log(`✅ Application is running on: http://localhost:${process.env.PORT || 3000}`);
};

bootstrap().catch((error) => {
  console.error("Error starting application:", error);
  process.exit(1);
});

