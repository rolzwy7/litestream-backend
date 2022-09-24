import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';

type Subtitle = {
  src: string;
  kind: string;
  language: string;
  label: string;
  contentType: string;
};

@Injectable()
export class StreamService {
  getMediaDir(...args: string[]): string {
    return join(__dirname, '..', 'media', ...args);
  }

  createAccessToken(
    stream_id: string,
    chapter_dir: string,
    expires_in: number = 24 * 60 * 60,
  ): string {
    return jwt.sign(
      {
        stream_id,
        chapter_dir,
      },
      process.env.SECRET,
      { expiresIn: expires_in },
    );
  }

  isAccessTokenValid(jwt_token: string): boolean {
    try {
      jwt.verify(jwt_token, process.env.SECRET);
      return true;
    } catch (err) {
      return false;
    }
  }

  decodeAccessToken(jwt_token: string): null | jwt.JwtPayload {
    return jwt.decode(jwt_token, { json: true });
  }

  buildStreamURL(token: string): string {
    return `${process.env.URL}/stream/proxy/${token}/manifest.mpd`;
  }

  buildSubtitleURL(
    stream_id: string,
    chapter_dir: string,
    sub_filename: string,
  ): string {
    return `${process.env.URL}/stream/subtitle/${stream_id}/${chapter_dir}/${sub_filename}`;
  }

  buildSubtitlesArray(
    stream_id: string,
    chapter_dir: string,
  ): Subtitle[] | null {
    const subs_filepath = this.getMediaDir(
      stream_id,
      chapter_dir,
      'subs',
      'subs.json',
    );

    if (!existsSync(subs_filepath)) return null;

    const subs_json = JSON.parse(readFileSync(subs_filepath, 'utf-8'));

    return subs_json.map((sub: Subtitle) => ({
      ...sub,
      src: this.buildSubtitleURL(stream_id, chapter_dir, sub.src),
    }));
  }
}
