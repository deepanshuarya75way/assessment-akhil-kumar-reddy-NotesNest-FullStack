const Document = require("../models/Document");
const slugify = require("./slugify");

async function generateUniqueSlug(title){
  const baseSlug = slugify(title);

  if(!baseSlug){
    throw new Error(" Document title cannot generate the slug");
  }

  let slug = baseSlug;
  let counter = 2;

  while(await Document.findOne({slug: slug})){
    slug = `${baseSlug}-${counter}`
    counter++;
 }

 return slug
}

module.exports = generateUniqueSlug;

