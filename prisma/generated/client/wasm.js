
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.2.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.2.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  user_id: 'user_id',
  email: 'email',
  username: 'username',
  password: 'password',
  phone: 'phone',
  first_name: 'first_name',
  last_name: 'last_name',
  date_ob: 'date_ob',
  avatar: 'avatar',
  is_google: 'is_google',
  role: 'role',
  verified: 'verified',
  created_at: 'created_at',
  updated_at: 'updated_at',
  verify_token: 'verify_token',
  password_reset_token: 'password_reset_token',
  referral_code: 'referral_code'
};

exports.Prisma.AddressScalarFieldEnum = {
  address_id: 'address_id',
  user_id: 'user_id',
  address_name: 'address_name',
  address: 'address',
  subdistrict: 'subdistrict',
  city: 'city',
  city_id: 'city_id',
  province: 'province',
  province_id: 'province_id',
  postcode: 'postcode',
  latitude: 'latitude',
  longitude: 'longitude',
  is_primary: 'is_primary',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ReferralScalarFieldEnum = {
  ref_id: 'ref_id',
  referrer_id: 'referrer_id',
  referred_id: 'referred_id',
  referral_code: 'referral_code',
  reward_id: 'reward_id'
};

exports.Prisma.VoucherScalarFieldEnum = {
  voucher_id: 'voucher_id',
  voucher_code: 'voucher_code',
  user_id: 'user_id',
  discount_id: 'discount_id',
  is_redeemed: 'is_redeemed',
  redeemed_at: 'redeemed_at',
  created_at: 'created_at',
  expires_at: 'expires_at'
};

exports.Prisma.DiscountScalarFieldEnum = {
  discount_id: 'discount_id',
  store_id: 'store_id',
  product_id: 'product_id',
  thumbnail: 'thumbnail',
  discount_code: 'discount_code',
  discount_type: 'discount_type',
  discount_value: 'discount_value',
  minimum_order: 'minimum_order',
  expires_at: 'expires_at',
  created_at: 'created_at',
  updated_at: 'updated_at',
  userUser_id: 'userUser_id'
};

exports.Prisma.StoreScalarFieldEnum = {
  store_id: 'store_id',
  store_name: 'store_name',
  address: 'address',
  subdistrict: 'subdistrict',
  city: 'city',
  province: 'province',
  postcode: 'postcode',
  latitude: 'latitude',
  longitude: 'longitude',
  created_at: 'created_at',
  updated_at: 'updated_at',
  user_id: 'user_id'
};

exports.Prisma.CategoryScalarFieldEnum = {
  category_id: 'category_id',
  category_name: 'category_name',
  description: 'description',
  category_thumbnail: 'category_thumbnail',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProductScalarFieldEnum = {
  product_id: 'product_id',
  store_id: 'store_id',
  name: 'name',
  description: 'description',
  price: 'price',
  category_id: 'category_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProductImageScalarFieldEnum = {
  image_id: 'image_id',
  product_id: 'product_id',
  url: 'url',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.InventoryScalarFieldEnum = {
  inv_id: 'inv_id',
  store_id: 'store_id',
  product_id: 'product_id',
  qty: 'qty',
  total_qty: 'total_qty',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.OrderScalarFieldEnum = {
  order_id: 'order_id',
  user_id: 'user_id',
  store_id: 'store_id',
  order_status: 'order_status',
  total_price: 'total_price',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  orderitem_id: 'orderitem_id',
  order_id: 'order_id',
  product_id: 'product_id',
  qty: 'qty',
  price: 'price',
  total_price: 'total_price'
};

exports.Prisma.ShippingScalarFieldEnum = {
  shipping_id: 'shipping_id',
  order_id: 'order_id',
  shipping_cost: 'shipping_cost',
  shipping_address: 'shipping_address',
  shipping_status: 'shipping_status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CartItemScalarFieldEnum = {
  cartitem_id: 'cartitem_id',
  user_id: 'user_id',
  product_id: 'product_id',
  quantity: 'quantity',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProvinceScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.CityScalarFieldEnum = {
  id: 'id',
  name: 'name',
  province_id: 'province_id'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  customer: 'customer',
  store_admin: 'store_admin',
  super_admin: 'super_admin'
};

exports.Type = exports.$Enums.Type = {
  point: 'point',
  percentage: 'percentage'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  pending: 'pending',
  awaiting_payment: 'awaiting_payment',
  processing: 'processing',
  shipped: 'shipped',
  completed: 'completed',
  cancelled: 'cancelled'
};

exports.ShippingStatus = exports.$Enums.ShippingStatus = {
  pending: 'pending',
  shipped: 'shipped',
  delivered: 'delivered'
};

exports.Prisma.ModelName = {
  User: 'User',
  Address: 'Address',
  Referral: 'Referral',
  Voucher: 'Voucher',
  Discount: 'Discount',
  Store: 'Store',
  Category: 'Category',
  Product: 'Product',
  ProductImage: 'ProductImage',
  Inventory: 'Inventory',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Shipping: 'Shipping',
  CartItem: 'CartItem',
  Province: 'Province',
  City: 'City'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
