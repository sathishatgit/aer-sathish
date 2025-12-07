import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('RFP Management System API')
    .setDescription(
      'AI-Powered RFP Management System - Manage RFPs, Vendors, and Proposals with AI assistance',
    )
    .setVersion('1.0')
    .addTag('RFPs', 'RFP management endpoints')
    .addTag('Vendors', 'Vendor management endpoints')
    .addTag('Proposals', 'Proposal management endpoints')
    .addTag('AI Prompts', 'AI prompt management endpoints')
    .addTag('Email', 'Email sending and receiving endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
}

bootstrap();
