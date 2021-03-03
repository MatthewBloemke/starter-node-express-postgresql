const SuppliersService = require("./suppliers.service.js");

const validFields = new Set([
  "supplier_name",
  "supplier_address_line_1",
  "supplier_address_line_2",
  "supplier_city",
  "supplier_state",
  "supplier_zip",
  "supplier_phone",
  "supplier_email",
  "supplier_notes",
  "supplier_type_of_goods",
]);


function hasValidFields(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    field => !validFields.has(field)
  );

  if (invalidFields.length)
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  next();
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Supplier must include a ${propertyName}` });
  };
}

const hasSupplierName = bodyDataHas("supplier_name");
const hasSupplierEmail = bodyDataHas("supplier_email");

function supplierExists(req, res, next) {
  const error = { status: 404, message: `Supplier cannot be found.` };
  const { supplierId } = req.params;
  if (!supplierId) return next(error);

  SuppliersService.getSupplierById(supplierId).then(supplier => {
    if (!supplier) return next(error);
    res.locals.supplier = supplier;
    next();
  });
}

async function create(req, res, next) {
  let newSupplier = await SuppliersService.createSupplier(req.body.data);
  res.status(201).json({ data: newSupplier });
}

async function update(req, res, next) {
  const {
    supplier: { supplier_id: supplierId, ...supplier },
  } = res.locals;
  const updatedSupplier = { ...supplier, ...req.body.data };

  const data = await SuppliersService.updateSupplierById(
    supplierId,
    updatedSupplier
  );
  res.json({ data });
}

async function destroy(req, res, next) {
  const { supplier } = res.locals;
  await SuppliersService.deleteSupplierById(supplier.supplier_id);
  res.sendStatus(204);
}

module.exports = {
  create: [hasValidFields, hasSupplierName, hasSupplierEmail, create],
  update: [supplierExists, update],
  destroy: [supplierExists, destroy],
};
