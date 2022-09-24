import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    StreamModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
