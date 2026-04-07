import { supabaseAnon } from "../lib/supabase.js";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (id) {
      const { data, error } = await supabaseAnon
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json(data);
    }

    const { data, error } = await supabaseAnon
      .from("products")
      .select("*");

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("api/products error:", error.message || error);
    return res.status(500).json({ error: error.message || "Unable to load products" });
  }
}
