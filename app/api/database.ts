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
    defaultRankings: string[],
    rankings: string[]
) {
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

export async function findRankings() {
    const cursor = collection.find(
        {},
        {
            projection: {
                albumName: true,
                rankings: true,
                nickname: true,
                defaultRankings: true,
            },
        }
    );

    let finalRankings: string[] = [];

    for await (const doc of cursor) {
        let tempAlbum = [];
        for (const song of doc.rankings) {
            tempAlbum.push(song);
        }
        finalRankings.push(tempAlbum.toString());
    }
    return finalRankings;
}
