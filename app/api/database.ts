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
    rankings: string[]
) {
    if (nickname != "") {
        await collection.updateOne(
            {
                nickname: nickname,
                albumName: albumName,
            },
            { $set: { rankings: rankings } },
            { upsert: true }
        );
    }
}

export async function findRanking(nickname: string, albumName?: string) {
    const cursor = collection.find(
        { nickname: { $eq: nickname }, albumName: { $eq: albumName } },
        {
            projection: {
                albumName: true,
                rankings: true,
                nickname: true,
            },
        }
    );
    let finalRankings: string[] = [];
    for await (const doc of cursor) {
        for await (const song of doc.rankings) {
            finalRankings.push(song);
        }
    }
    return finalRankings;
}

export async function findAlbums(nickname: string) {
    const cursor = collection.find(
        { nickname: { $eq: nickname } },
        {
            projection: {
                albumName: true,
                rankings: true,
                nickname: true,
            },
        }
    );
    let albums: string[] = [];
    for await (const doc of cursor) {
        albums.push(doc.albumName);
    }
    return albums;
}

export async function checkRankings(nickname: string) {
    const cursor = collection.find(
        { nickname: { $eq: nickname } },
        {
            projection: {
                albumName: true,
                rankings: true,
                nickname: true,
            },
        }
    );
    return cursor.hasNext();
}
