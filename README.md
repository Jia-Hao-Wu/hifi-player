# hifi-music-player

A hi-fi music player built with Expo and React Native. Provides search, queuing, and playback with streaming integration.

## Features

- Search across tracks, albums, artists, and playlists
- Audio playback with queue management and track controls
- Infinite scroll pagination on search results
- Streaming via Tidal integration

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npx expo start
```

## Project structure

```
api/          API client, search, streaming, and metadata
app/          File-based routing (Expo Router)
components/   UI components, search views, player controls
contexts/     React context providers (player state)
hooks/        Custom hooks (search, debounce, infinite scroll)
constants/    Theme, track types
```

## Legal notice

This project does not store, host, or distribute any music, audio files, or other copyrighted media. All media content is streamed from third-party services. The developers assume no responsibility for how this software is used.

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
