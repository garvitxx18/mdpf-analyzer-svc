import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Portfolio Analyzer API")
    .setDescription("AI-powered portfolio scoring and rebalancing service using Gemini AI")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  
  await app.listen(process.env.PORT || 3000);
  console.log(`✅ Application is running on: http://localhost:${process.env.PORT || 3000}`);
  console.log(`📚 Swagger docs: http://localhost:${process.env.PORT || 3000}/api`);
};

bootstrap().catch((error) => {
  console.error("Error starting application:", error);
  process.exit(1);
});

