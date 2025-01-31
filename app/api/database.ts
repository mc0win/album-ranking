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

export async function sendRankings(
    nickname: string,
    albumName: string | undefined
) {
    const oldDoc = await collection.findOne({
        nickname: nickname,
        albumName: albumName,
    });
    return oldDoc !== null;
}

export async function updateRankings(
    nickname: string,
    albumName: string | undefined,
    rankings: string
) {
    const filter = { nickname: nickname, albumName: albumName };
    await collection.updateOne(filter, { $set: { rankings: rankings } });
}

export async function initRankings(
    nickname: string,
    albumName: string | undefined,
    rankings: string
) {
    await collection.insertOne({
        nickname: nickname,
        albumName: albumName,
        rankings: rankings,
    });
}
