import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  
  const staticOrigins = [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
  ];

  if (process.env.FRONTEND_URL) {
    try {
      const frontendUrl = process.env.FRONTEND_URL.trim();
      const url = new URL(frontendUrl);
      const origin = `${url.protocol}//${url.host}`;
      
      if (!staticOrigins.includes(origin)) {
        staticOrigins.push(origin);
      }
    } catch (error) {
      console.warn(`Invalid FRONTEND_URL format: ${process.env.FRONTEND_URL}`);
    }
  }

  const corsOriginFunction = (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ): void => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isStaticOrigin = staticOrigins.includes(origin);
    const isDbGlobalHackathonOrigin = origin.startsWith("https://db-global-hackathon");

    if (isStaticOrigin || isDbGlobalHackathonOrigin) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  };

  console.log(`🔒 CORS enabled for:`);
  console.log(`   - Static origins: ${staticOrigins.join(", ")}`);
  console.log(`   - Dynamic origins: https://db-global-hackathon* (all URLs starting with this)`);

  app.enableCors({
    origin: corsOriginFunction,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });


  await app.listen(process.env.PORT || 3000);
  console.log(
    `✅ Application is running on: http://localhost:${process.env.PORT || 3000}`
  );
};

bootstrap().catch((error) => {
  console.error("Error starting application:", error);
  process.exit(1);
});

