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
    await collection.updateOne(
        {
            nickname: nickname,
            albumName: albumName,
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
            },
        }
    );

    let finalRankings = new Map<string, Map<string, number>>();

    for await (const doc of cursor) {
        let albumName: string = doc.albumName;
        if (!finalRankings.has(albumName)) {
            let tempRankings = new Map<string, number>();
            for await (const song of doc.rankings) {
                tempRankings.set(song, doc.rankings.indexOf(song));
            }
            finalRankings.set(albumName, tempRankings);
        } else {
            let tempRankings = finalRankings.get(albumName);
            if (tempRankings != undefined) {
                for await (const song_1 of doc.rankings) {
                    tempRankings.set(
                        song_1,
                        tempRankings.get(song_1) + doc.rankings.indexOf(song_1)
                    );
                }
                let sortedRankings = new Map(
                    Array.from(tempRankings).sort((a, b) => a[1] - b[1])
                );
                finalRankings.set(albumName, sortedRankings);
            }
        }
    }
    return finalRankings;
}
