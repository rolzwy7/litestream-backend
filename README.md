# litestream-backend

Simple MPEG-DASH streaming library with JWT security feature.

litestream-backend is a [NestJS](https://docs.nestjs.com/) application.

Main objectives:
- to provide easy way of securely sharing MPEG-DASH streams
- be simple and lightweight

# How it works?

1. You have your application that needs to provide MPEG-DASH video streaming for its clients. (lets call it `Main Server`, accessible with URL: `myapp.pl`)
2. You install `litestream-backend` so its accesible for example through subdomain: `stream.myapp.pl` (lets call it `Streaming Server`)
3. `Main Server` sends POST HTTP request with password to `Streaming Server`
4. If password authentication is successfull `Main Server` gets JSON response containing everything that MPEG-DASH video player needs to correctly play video stream (JWT token protected stream URLs, subtitles, chapters, titles).

##### What litestream-backend can do?
- Share URLs containing JWT token that point to MPEG-DASH manifest file
- Server-to-Server plaintext password authorization
- Can handle subtitles (if provided in stream directory)
- Stream can contain many chapters (many MPEG-DASH streams under the same stream id)

##### What litestream-backend can't do?
- Convert videos to MPEG-DASH format. You need to do it yourself.
- Create [Media directory structure](#media-directory-structure)

## Installation & Running dev

Clone the repository. Run `npm install` command in `litestream-backend` directory.
Run `npm run start:dev` to start application in dev mode.
```
cd litestream-backend
npm install
npm run start:dev
```

Default `.env` configuration for dev is:
```
MEDIA_DIR=D:\Media\
PASSWORD=123456
SECRET=3FOHznZKQlSXXosRO0W6lXwpJL1taGx3
URL=http://localhost:8080
```

You must change `MEDIA_DIR` to your own path. Rest of the configuration can stay the same in dev.

## Running in production

litestream-backend is a NestJS application and can be build for production with `npm run build` command.

## Configuration for production

Before you run `litestream-backend` its recomennded to change `.env` file variables:
- set your own `MEDIA_DIR` which is a directory containing all the media directories
- set your own `PASSWORD` that is used to access video streams
- set your own `SECRET` that is used to sign JWT tokens (must be 32 bytes)
- set `URL` to your own address under which litestream-backend is accessible

## Media directory structure

Stream files handled by `litestream-backend` must follow certain format in media directory.

Example:
```
<MEDIA_DIR>/
    css-for-beginners/
        chapters.json
        chapter_1/
            <MPEG-DASH files>
        some_other_chapter/
            <MPEG-DASH files>
        chapter_with_subtitles/
            <MPEG-DASH files>
            subs/
                en.vtt
                de.vtt
                subs.json
```

1. **Media directory** is a directory that is placed directly under `MEDIA_DIR` directory.
2. The name of the **Media directory** is called a **stream_id**
3. **Media directory** (in the example *css-for-beginners*) contians file **chapters.json** that describes every chapter of a stream in JSON format.
4. Every directory placed directly under **Media directory** and described in chapters.json is called **Chapter directory** (in the example: *chapter_1*, *some_other_chapter* and *chapter_with_subtitles*).
5. Every **Chapter directory** contains MPEG-DASH files (audio/video segments, manifest). Optionally **Chapter directory** can contain `subs` directory containing subtitles (in example *chapter_with_subtitles*).
6. `subs` directory contains **subs.json** that describes subtitles.

Example **chapters.json** file contents:
```
[
  {
    "title": "Title for chapter 1",
    "duration": {
      "h": 1,
      "m": 13,
      "s": 33
    },
    "dir": "chapter_1"
  },
  {
    "title": "Title for chapter 2",
    "duration": {
      "h": 1,
      "m": 15,
      "s": 46
    },
    "dir": "chapter_2"
  }
]
```

Example **subs.json** file contents:

```
[
  {
    "src": "en.vtt",
    "kind": "subtitles",
    "language": "en",
    "label": "English",
    "contentType": "text/vtt"
  },
  {
    "src": "no.vtt",
    "kind": "subtitles",
    "language": "no",
    "label": "Norwegian",
    "contentType": "text/vtt"
  }
]

```