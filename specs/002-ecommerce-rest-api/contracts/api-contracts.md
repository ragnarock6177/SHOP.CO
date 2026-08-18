# API Interface Contracts: REST API Layer (`/api/v1`)

This document defines all endpoints, HTTP methods, validation schemas, and service contracts for the e-commerce backend API.

---

## 1. Authentication & Account Module (`/api/v1/auth`, `/api/v1/users`)

| Method | Endpoint | Auth | Role | Validation Schema | Controller | Service Operation |
|---|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | None | Public | `RegisterSchema` | `AuthController.register` | `AuthService.registerUser` |
| `POST` | `/api/v1/auth/login` | None | Public | `LoginSchema` | `AuthController.login` | `AuthService.loginUser` |
| `POST` | `/api/v1/auth/firebase` | Bearer Token | Public | `FirebaseLoginSchema` | `AuthController.firebaseLogin` | `AuthService.verifyFirebaseAndLogin` |
| `GET` | `/api/v1/users/me` | Bearer Token | Authenticated | None | `UserController.getProfile` | `UserService.getUserById` |
| `PATCH` | `/api/v1/users/me` | Bearer Token | Authenticated | `UpdateProfileSchema` | `UserController.updateProfile` | `UserService.updateUserProfile` |
| `GET` | `/api/v1/users/me/addresses` | Bearer Token | Authenticated | None | `UserController.getAddresses` | `UserService.getUserAddresses` |
| `POST` | `/api/v1/users/me/addresses` | Bearer Token | Authenticated | `CreateAddressSchema` | `UserController.addAddress` | `UserService.addUserAddress` |
| `DELETE` | `/api/v1/users/me/addresses/:id` | Bearer Token | Authenticated | `IdParamSchema` | `UserController.deleteAddress` | `UserService.softDeleteAddress` |

---

## 2. Catalog & Taxonomy Module (`/api/v1/collections`, `/api/v1/categories`, `/api/v1/products`)

| Method | Endpoint | Auth | Role | Validation Schema | Controller | Service Operation |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/collections` | None | Public | None | `CatalogController.getCollections` | `CatalogService.listCollections` |
| `GET` | `/api/v1/collections/:slug` | None | Public | `SlugParamSchema` | `CatalogController.getCollectionBySlug` | `CatalogService.getCollectionBySlug` |
| `GET` | `/api/v1/categories` | None | Public | None | `CatalogController.getCategories` | `CatalogService.listCategoriesTree` |
| `GET` | `/api/v1/categories/:slug` | None | Public | `SlugParamSchema` | `CatalogController.getCategoryBySlug` | `CatalogService.getCategoryBySlug` |
| `GET` | `/api/v1/products` | None | Public | `ProductFilterQuerySchema` | `ProductController.getProducts` | `ProductService.listProducts` |
| `GET` | `/api/v1/products/:slug` | None | Public | `SlugParamSchema` | `ProductController.getProductBySlug` | `ProductService.getProductDetailsBySlug` |

---

## 3. Cart & Wishlist Module (`/api/v1/cart`, `/api/v1/wishlist`)

| Method | Endpoint | Auth | Role | Validation Schema | Controller | Service Operation |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/cart` | Optional | Public/Auth | None | `CartController.getCart` | `CartService.getOrCreateCart` |
| `POST` | `/api/v1/cart/items` | Optional | Public/Auth | `AddCartItemSchema` | `CartController.addItem` | `CartService.addItemToCart` |
| `PATCH` | `/api/v1/cart/items/:id` | Optional | Public/Auth | `UpdateCartItemSchema` | `CartController.updateItem` | `CartService.updateItemQuantity` |
| `DELETE` | `/api/v1/cart/items/:id` | Optional | Public/Auth | `IdParamSchema` | `CartController.removeItem` | `CartService.removeItemFromCart` |
| `POST` | `/api/v1/cart/merge` | Bearer Token | Authenticated | `MergeCartSchema` | `CartController.mergeCart` | `CartService.mergeGuestCartToUser` |
| `GET` | `/api/v1/wishlist` | Bearer Token | Authenticated | None | `WishlistController.getWishlist` | `WishlistService.getUserWishlist` |
| `POST` | `/api/v1/wishlist/items` | Bearer Token | Authenticated | `WishlistItemSchema` | `WishlistController.addItem` | `WishlistService.addProductToWishlist` |
| `DELETE` | `/api/v1/wishlist/items/:productId` | Bearer Token | Authenticated | `ProductIdParamSchema` | `WishlistController.removeItem` | `WishlistService.removeProductFromWishlist` |

---

## 4. Checkout & Orders Module (`/api/v1/orders`, `/api/v1/invoices`)

| Method | Endpoint | Auth | Role | Validation Schema | Controller | Service Operation |
|---|---|---|---|---|---|---|
| `POST` | `/api/v1/orders` | Bearer Token | Authenticated | `CreateOrderSchema` | `OrderController.placeOrder` | `OrderService.createOrder` (`$transaction`) |
| `GET` | `/api/v1/orders` | Bearer Token | Authenticated | `PaginationQuerySchema` | `OrderController.getUserOrders` | `OrderService.getUserOrders` |
| `GET` | `/api/v1/orders/:orderNumber` | Bearer Token | Authenticated | `OrderNumberParamSchema` | `OrderController.getOrderByNumber` | `OrderService.getOrderByNumber` |
| `POST` | `/api/v1/orders/:id/cancel` | Bearer Token | Authenticated | `IdParamSchema` | `OrderController.cancelOrder` | `OrderService.cancelOrder` (`$transaction`) |
| `GET` | `/api/v1/invoices/:orderId` | Bearer Token | Authenticated | `OrderIdParamSchema` | `InvoiceController.getInvoice` | `InvoiceService.getInvoiceByOrderId` |

---

## 5. Payments, Reviews & Returns (`/api/v1/payments`, `/api/v1/reviews`, `/api/v1/returns`)

| Method | Endpoint | Auth | Role | Validation Schema | Controller | Service Operation |
|---|---|---|---|---|---|---|
| `POST` | `/api/v1/payments/create-intent` | Bearer Token | Authenticated | `CreatePaymentIntentSchema` | `PaymentController.createIntent` | `PaymentService.createPaymentIntent` |
| `POST` | `/api/v1/payments/webhook` | Raw Body | Webhook | Signature Header | `PaymentController.handleWebhook` | `PaymentService.handlePaymentSuccess` (`$transaction`) |
| `GET` | `/api/v1/products/:productId/reviews` | None | Public | `PaginationQuerySchema` | `ReviewController.getProductReviews` | `ReviewService.getReviewsForProduct` |
| `POST` | `/api/v1/reviews` | Bearer Token | Authenticated | `CreateReviewSchema` | `ReviewController.createReview` | `ReviewService.submitProductReview` |
| `POST` | `/api/v1/returns` | Bearer Token | Authenticated | `CreateReturnSchema` | `ReturnController.requestReturn` | `ReturnService.submitReturnRequest` |

---

## 6. Admin Management (`/api/v1/admin/*`)

| Method | Endpoint | Auth | Role | Validation Schema | Controller | Service Operation |
|---|---|---|---|---|---|---|
| `POST` | `/api/v1/admin/products` | Bearer Token | Admin | `CreateProductSchema` | `AdminProductController.createProduct` | `AdminProductService.createProduct` |
| `PUT` | `/api/v1/admin/products/:id` | Bearer Token | Admin | `UpdateProductSchema` | `AdminProductController.updateProduct` | `AdminProductService.updateProduct` |
| `DELETE` | `/api/v1/admin/products/:id` | Bearer Token | Admin | `IdParamSchema` | `AdminProductController.deleteProduct` | `AdminProductService.softDeleteProduct` |
| `PATCH` | `/api/v1/admin/orders/:id/status` | Bearer Token | Admin | `UpdateOrderStatusSchema` | `AdminOrderController.updateStatus` | `AdminOrderService.updateOrderStatus` |
| `POST` | `/api/v1/admin/shipments` | Bearer Token | Admin | `CreateShipmentSchema` | `AdminShipmentController.createShipment` | `AdminShipmentService.createShipment` |
| `PATCH` | `/api/v1/admin/inventory/:variantId` | Bearer Token | Admin | `AdjustInventorySchema` | `AdminInventoryController.adjustStock` | `AdminInventoryService.adjustInventory` |
| `GET` | `/api/v1/admin/audit-logs` | Bearer Token | Admin | `PaginationQuerySchema` | `AdminAuditController.getAuditLogs` | `AdminAuditService.getAuditLogs` |
