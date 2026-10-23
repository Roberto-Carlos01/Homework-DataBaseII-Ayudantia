import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // GET /health -> sirve para comprobar que la API está viva
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
