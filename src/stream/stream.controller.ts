import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { createReadStream, existsSync, readFileSync } from 'fs';
import { StreamService } from './stream.service';

type Chapter = {
  title: string;
  dir: string;
};

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  /**
   *
   * @param stream_id stream idintifier
   * @param password password used in server-server authorization
   * @param expires_in JWT expiration in seconds
   * @returns Array of available chapters (videos) with JWT access tokens and additional metadata
   */
  @Post('access/:stream_id')
  getJwtToken(
    @Param('stream_id') stream_id: string,
    @Body('password') password: string,
    @Body('expires_in') expires_in: number,
  ) {
    if (password !== process.env.PASSWORD) throw new UnauthorizedException();

    const chapters_filepath = this.streamService.getMediaDir(
      stream_id,
      'chapters.json',
    );

    if (!existsSync(chapters_filepath)) throw new BadRequestException();

    const chapters_json = JSON.parse(readFileSync(chapters_filepath, 'utf-8'));

    return chapters_json.map((chapter: Chapter) => ({
      ...chapter,
      player_url: this.streamService.buildStreamURL(
        this.streamService.createAccessToken(
          stream_id,
          chapter.dir,
          expires_in,
        ),
      ),
      subs: this.streamService.buildSubtitlesArray(stream_id, chapter.dir),
    }));
  }

  /**
   *
   * @param jwt_token JWT token
   * @param filename MPEG-Dash file (requested by player)
   * @returns
   */
  @Get('proxy/:jwt_token/:filename')
  getStreamProxy(
    @Param('jwt_token') jwt_token: string,
    @Param('filename') filename: string,
  ) {
    if (!this.streamService.isAccessTokenValid(jwt_token)) {
      throw new BadRequestException();
    }

    const decoded = this.streamService.decodeAccessToken(jwt_token);
    if (decoded === null) throw new BadRequestException();

    const filepath = this.streamService.getMediaDir(
      decoded.stream_id,
      decoded.chapter_dir,
      filename,
    );

    if (!existsSync(filepath)) throw new InternalServerErrorException();

    return new StreamableFile(createReadStream(filepath));
  }

  /**
   *
   * @param stream_id stream identifier
   * @param chapter_dir chapter dir name
   * @param filename subtitle filename
   * @returns
   */
  @Get('subtitle/:stream_id/:chapter_dir/:filename')
  getSubtitle(
    @Param('stream_id') stream_id: string,
    @Param('chapter_dir') chapter_dir: string,
    @Param('filename') filename: string,
  ) {
    const filepath = this.streamService.getMediaDir(
      stream_id,
      chapter_dir,
      'subs',
      filename,
    );

    if (!existsSync(filepath)) {
      return 'no subtitles with this filename';
    }

    return new StreamableFile(createReadStream(filepath));
  }
}
