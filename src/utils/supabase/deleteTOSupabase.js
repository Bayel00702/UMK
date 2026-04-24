const supabase = require("./supabase")

const deleteFromSupabase = async (fileUrl) => {
    try {
        if (!fileUrl) return

        const parts = fileUrl.split("/materials/")
        if (parts.length < 2) return

        const fileName = parts[1]

        await supabase.storage
            .from("materials")
            .remove([fileName])

    } catch (err) {
        console.error("Delete from Supabase error:", err)
    }
}

module.exports = deleteFromSupabase