import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import { Subtitle } from './stream.types';

@Injectable()
export class StreamService {
  /**
   * Returns path media directory
   *
   * @param args list of path parts
   * @returns path to media directory
   */
  getMediaDir(...args: string[]): string {
    return join(process.env.MEDIA_DIR, ...args);
  }

  /**
   * Create JWT token
   *
   * @param stream_id id of stream
   * @param chapter_dir name of stream chapter
   * @param expires_in expiration time in seconds
   * @returns JWT token
   */
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

  /**
   * Check if JWT token is valid
   *
   * @param jwt_token JWT token
   * @returns true if token is valid, false othewise
   */
  isAccessTokenValid(jwt_token: string): boolean {
    try {
      jwt.verify(jwt_token, process.env.SECRET);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Decodes JWT token
   *
   * @param jwt_token
   * @returns decoded JWT token data
   */
  decodeAccessToken(jwt_token: string): null | jwt.JwtPayload {
    return jwt.decode(jwt_token, { json: true });
  }

  /**
   * Builds URL poiting to MPEG-DASH manifest file
   *
   * @param token JWT token
   * @returns URL to mainfest.mpd
   */
  buildStreamURL(token: string): string {
    return `${process.env.URL}/stream/proxy/${token}/manifest.mpd`;
  }

  /**
   * Builds URL for given subtitle file
   *
   * @param stream_id id os stream
   * @param chapter_dir name of stream chapter
   * @param sub_filename filename of subtitle file
   * @returns URL to subtitle file
   */
  buildSubtitleURL(
    stream_id: string,
    chapter_dir: string,
    sub_filename: string,
  ): string {
    return `${process.env.URL}/stream/subtitle/${stream_id}/${chapter_dir}/${sub_filename}`;
  }

  /**
   * Based on subs.json file in stream directory build subtitle array response
   *
   * @param stream_id id of stream
   * @param chapter_dir name of stream chapter
   * @returns array of subtitles or null
   */
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
