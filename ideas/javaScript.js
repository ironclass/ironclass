hbs.registerHelper("ifUndefined", (value, options) => {
  if (arguments.length < 2) throw new Error("Handlebars Helper needs ONE parameter");

  let fnTrue = options.inverse;
  let fnFalse = options.fn;

  return typeof value !== undefined ? fnTrue(this) : fnFalse(this);
});
hbs.registerHelper("isSmallerThanSeven", (value, options) => {
  let fnTrue = options.fn;
  let fnFalse = options.inverse;

  return value < 7 ? fnTrue(this) : fnFalse(this);
});

hbs.registerHelper("isUser", function(value, options) {
  let fnTrue = options.fn;
  let fnFalse = options.inverse;

  return value === req.user.username ? fnTrue(this) : fnFalse(this);
});
hbs.registerHelper("isRole", function(value, options) {
  let fnTrue = options.fn;
  let fnFalse = options.inverse;

  return value === req.user.role ? fnTrue(this) : fnFalse(this);
});