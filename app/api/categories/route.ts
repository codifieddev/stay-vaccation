import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";

// GET ALL CATEGORIES (or single by ?slug=)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    const db = await getDatabase();
    const collection = db.collection("categories");

    if (slug) {
      const cat = await collection.findOne({ slug });
      if (!cat) {
        return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { ...cat, _id: cat._id.toString() } });
    }

    const categories = await collection.aggregate([
      {
        $addFields: {
          sortOrder: { $ifNull: [ "$displayOrder", 999999999 ] }
        }
      },
      {
        $sort: { sortOrder: 1, name: 1 }
      }
    ]).toArray();
    
    return NextResponse.json({ 
      success: true, 
      data: categories.map(c => ({ ...c, _id: c._id.toString() })) 
    });
  } catch (err) {
    console.error("CATEGORIES GET ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// CREATE CATEGORY
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const { _id, ...insertData } = body;
    
    const result = await db.collection("categories").insertOne({
      ...insertData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newCategory = {
      _id: result.insertedId.toString(),
      ...insertData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: newCategory,
    });
  } catch (err) {
    console.error("CATEGORY POST ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
