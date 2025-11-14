from backend.db.mongo_connection import connect
import asyncio

async def main():
    db = connect()
    print("✅ Connected to MongoDB:", db.name)
    await db["test_collection"].insert_one({"ping": "hello"})
    doc = await db["test_collection"].find_one({"ping": "hello"})
    print("✅ Test document found:", doc)

if __name__ == "__main__":
    asyncio.run(main())
