const supabase = require("./supabase")

const deleteFromSupabase = async (fileUrl) => {
    const fileName = fileUrl.split("/materials/")[1]

    await supabase.storage
        .from("materials")
        .remove([fileName])
}

module.exports = deleteFromSupabase