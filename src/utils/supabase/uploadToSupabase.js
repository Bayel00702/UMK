const path = require("path")
const supabase = require("./supabase")

const uploadToSupabase = async (file) => {
    const originalName = Buffer.from(
        file.originalname,
        "latin1"
    ).toString("utf8")

    const ext = path.extname(originalName)

    const safeFileName =
        Date.now() + ext

    const { error } = await supabase.storage
        .from("materials")
        .upload(
            safeFileName,
            file.buffer,
            {
                contentType: file.mimetype
            }
        )

    if (error) {
        throw error
    }

    const { data } = supabase.storage
        .from("materials")
        .getPublicUrl(safeFileName)

    return {
        url: data.publicUrl,
        fileName: originalName
    }
}

module.exports = uploadToSupabase