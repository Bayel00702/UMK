const supabase = require("./supabase")

const uploadToSupabase = async (file) => {
    const safeName = file.originalname
        .replace(/[^a-zA-Z0-9.]/g, "_")

    const fileName = Date.now() + "-" + safeName

    const { error } = await supabase.storage
        .from("materials")
        .upload(fileName, file.buffer, {
            contentType: file.mimetype
        })

    if (error) {
        throw error
    }

    const { data } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName)

    return data.publicUrl
}

module.exports = uploadToSupabase