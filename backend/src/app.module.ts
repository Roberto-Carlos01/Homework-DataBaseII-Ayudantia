import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    // Lee las variables de entorno (archivo .env o variables del contenedor)
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a PostgreSQL usando las variables de entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'docker_tienda'),
        autoLoadEntities: true,
        // Las tablas ya existen: las crea init.sql en el contenedor de PostgreSQL.
        // TypeORM NO debe crearlas ni modificarlas.
        synchronize: false,
      }),
    }),

    CategoriesModule,
    ProductsModule,
    StudentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
