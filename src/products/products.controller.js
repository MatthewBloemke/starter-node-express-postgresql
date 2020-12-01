const ProductsService = require("./products.service");

async function productExists(req, res, next) {
  const error = { status: 404, message: `Product cannot be found.` };

  const { productId } = req.params;
  if (!productId) return next(error);

  let product = await ProductsService.getProductById(productId);

  if (!product) return next(error);
  res.locals.product = product;
  next();
}

function read(req, res, next) {
  const { product } = res.locals;
  res.json({ data: product });
}

async function list(req, res, next) {
  let products = await ProductsService.getAllProducts();
  res.json({ data: products });
}

module.exports = {
  read: [productExists, read],
  list: [list],
};
