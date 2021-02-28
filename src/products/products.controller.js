const ProductsService = require("./products.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function productExists(req, res, next) {
  const error = { status: 404, message: `Product cannot be found.` };

  const { productId } = req.params;
  if (!productId) return next(error);

  const product = await ProductsService.getProductById(productId);

  if (!product) return next(error);
  res.locals.product = product;
  next();
}

function read(req, res, next) {
  const { product } = res.locals;
  res.json({ data: product });
}

async function list(req, res, next) {
  const products = await ProductsService.getAllProducts();
  res.json({ data: products });
}

async function listOutOfStockCount(req, res, next) {
  res.json({ data: await ProductsService.getOutOfStockCount() });
}

async function listPriceSummary(req, res, next) {
  res.json({ data: await ProductsService.getPriceSummary() });
}

async function listTotalWeightByProduct(req, res, next) {
  res.json({ data: await ProductsService.getTotalWeightByProduct() });
}

module.exports = {
  read: [asyncErrorBoundary(productExists), asyncErrorBoundary(read)],
  list: asyncErrorBoundary(list),
  listOutOfStockCount: asyncErrorBoundary(listOutOfStockCount),
  listPriceSummary: asyncErrorBoundary(listPriceSummary),
  listTotalWeightByProduct: asyncErrorBoundary(listTotalWeightByProduct),
};
