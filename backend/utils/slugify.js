function slugify(text){
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"_")
    .replace(/^-+|-+$/g,"")
}

module.exports = slugify;