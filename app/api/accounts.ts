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
const collection = database.collection("accounts");
const bcrypt = require("bcrypt");

export async function validatePassword(nickname: string, password: string) {
    const cursor = collection.find(
        { nickname: { $eq: nickname } },
        {
            projection: {
                password: true,
            },
        }
    );
    for await (const doc of cursor) {
        return bcrypt.compareSync(password, doc.password);
    }
}
