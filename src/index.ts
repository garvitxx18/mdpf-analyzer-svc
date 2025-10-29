import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins: string[] = [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://db-global-hackathon-pjh7hri0q-kanekis-projects-237d2960.vercel.app",
  ];

  if (process.env.FRONTEND_URL) {
    try {
      const frontendUrl = process.env.FRONTEND_URL.trim();
      const url = new URL(frontendUrl);
      const origin = `${url.protocol}//${url.host}`;
      
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    } catch (error) {
      console.warn(`Invalid FRONTEND_URL format: ${process.env.FRONTEND_URL}`);
    }
  }

  console.log(`🔒 CORS enabled for origins: ${allowedOrigins.join(", ")}`);

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 3000);
  console.log(`✅ Application is running on: http://localhost:${process.env.PORT || 3000}`);
};

bootstrap().catch((error) => {
  console.error("Error starting application:", error);
  process.exit(1);
});

