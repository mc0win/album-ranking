"use server";

import { MongoClient, ServerApiVersion } from "mongodb";
import { URI } from "@/app/secret";

const client = new MongoClient(URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const database = client.db("server");
const collection = database.collection("rankings");

export async function rankingExists(
    nickname: string,
    albumName: string | undefined
) {
    const oldDoc = await collection.findOne({
        nickname: nickname,
        albumName: albumName,
    });
    return oldDoc !== null;
}

export async function upsertRankings(
    nickname: string,
    albumName: string | undefined,
    defaultRankings: string[] | undefined,
    rankings: string[]
) {
    if (nickname != "") {
        await collection.updateOne(
            {
                nickname: nickname,
                albumName: albumName,
                defaultRankings: defaultRankings,
            },
            { $set: { rankings: rankings } },
            { upsert: true }
        );
    }
}

export async function findRanking(nickname: string, albumName: string) {
    let finalRankings: string[] = [];
    for (const song of (
        await collection
            .find(
                { nickname: { $eq: nickname }, albumName: { $eq: albumName } },
                {
                    projection: {
                        rankings: true,
                    },
                }
            )
            .next()
    )?.rankings) {
        finalRankings.push(song);
    }
    return finalRankings;
}

export async function findTotalRankings(albumName: string) {
    let defaultRankings = (
        await collection
            .find(
                { albumName: { $eq: albumName } },
                {
                    projection: {
                        defaultRankings: true,
                        rankings: true,
                        nickname: true,
                    },
                }
            )
            .next()
    )?.defaultRankings;

    let finalRankings = new Map<string, Map<string, number>>();
    for (const song of defaultRankings) {
        let users = new Map<string, number>();
        for await (const doc of collection.find(
            { albumName: { $eq: albumName } },
            {
                projection: {
                    defaultRankings: true,
                    rankings: true,
                    nickname: true,
                },
            }
        )) {
            users.set(doc.nickname, doc.rankings.indexOf(song) + 1);
        }
        finalRankings.set(song, users);
    }

    return finalRankings;
}

export async function findAlbums(nickname: string) {
    let albums: string[] = [];
    for await (const doc of collection.find(
        { nickname: { $eq: nickname } },
        {
            projection: {
                albumName: true,
            },
        }
    )) {
        albums.push(doc.albumName);
    }
    return albums;
}

export async function findSongs(albumName: string) {
    let songs: string[] = [];
    for await (const song of (
        await collection
            .find(
                { albumName: { $eq: albumName } },
                {
                    projection: {
                        defaultRankings: true,
                    },
                }
            )
            .next()
    )?.defaultRankings) {
        songs.push(song);
    }
    return songs;
}

export async function findAllAlbums() {
    let albums: string[] = [];
    for await (const doc of collection.find(
        {},
        {
            projection: {
                albumName: true,
            },
        }
    )) {
        if (albums.indexOf(doc.albumName) == -1) {
            albums.push(doc.albumName);
        }
    }
    return albums;
}

export async function checkRankings(nickname: string) {
    const cursor = collection.find({ nickname: { $eq: nickname } });
    return cursor.hasNext();
}
