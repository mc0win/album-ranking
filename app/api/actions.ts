"use server";

import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const discogs = require("disconnect").Client;
const spotify = SpotifyApi.withClientCredentials(
    process.env.SPOTIFY_CLIENT_ID,
    process.env.SPOTIFY_CLIENT_SECRET
);

const discogsReleasePattern = /release\/(\d+)/;
const discogsMastersPattern = /master\/(\d+)/;
const spotifyPattern = /album\/([0-9a-zA-Z]+)/;

export async function getAlbumInfo(
    source: string,
    link: string
): Promise<AlbumQuery> {
    if (source.includes("discogs")) {
        const res = await processDiscogs(source, link);
        return {
            result: res,
        };
    }
    const res = await processSpotify(link);
    return {
        result: res,
    };
}

async function processDiscogs(
    source: string,
    link: string
): Promise<SearchResult | null> {
    const db = new discogs("AlbumRanking/1.0").database();
    if (source === "discogs-master") {
        const group = discogsMastersPattern.exec(link);
        const match = group?.[1];
        if (match === undefined) {
            return null;
        }
        const id = Number.parseInt(match);
        const master = await db.getMaster(id);
        const tracks = master.tracklist
            .filter((t: { type_: string }) => t.type_ !== "heading")
            .map((t: { title: string }, i: number) => {
                return {
                    id: i,
                    name: t.title,
                };
            });
        return {
            albumName: master.title,
            artistName: master.artists,
            songs: tracks,
        };
    }
    const group = discogsReleasePattern.exec(link);
    const match = group?.[1];
    if (match === undefined) {
        return null;
    }
    const id = Number.parseInt(match);
    const release = await db.getRelease(id);
    const tracks = release.tracklist
        .filter((t: { type_: string }) => t.type_ !== "heading")
        .map((t: { title: string }, i: number) => {
            return {
                id: i,
                name: t.title,
            };
        });
    return {
        albumName: release.title,
        artistName: release.artists,
        songs: tracks,
    };
}

async function processSpotify(link: string): Promise<SearchResult | null> {
    const group = spotifyPattern.exec(link);
    const match = group?.[1];
    if (match === undefined) {
        return null;
    }
    const album = await spotify.albums.get(match);
    const tracks = album.tracks.items.map((t, i) => {
        return {
            id: i,
            name: t.name,
        };
    });
    return {
        albumName: album.name,
        artistName: album.artists.toString(),
        songs: tracks,
    };
}
