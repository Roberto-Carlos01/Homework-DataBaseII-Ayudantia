import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: permite que el frontend (Next.js) consuma la API desde otro origen
  app.enableCors();

  // Valida automáticamente los DTOs de cada petición
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos que no están en el DTO
      forbidNonWhitelisted: true, // responde 400 si llegan campos desconocidos
      transform: true, // convierte el body en instancias del DTO
    }),
  );

  const port = Number(process.env.PORT ?? 3000);

  // 0.0.0.0: escucha en todas las interfaces.
  // Es necesario dentro de Docker para que la API sea accesible desde fuera del contenedor.
  await app.listen(port, '0.0.0.0');
  console.log(`API escuchando en http://0.0.0.0:${port}`);
}

bootstrap();
