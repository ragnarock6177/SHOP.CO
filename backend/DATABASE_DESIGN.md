-- ============================================================
-- AIRAVE E-COMMERCE DATABASE
-- PostgreSQL 16+
-- Single Brand / Single Vendor Fashion E-commerce
-- ============================================================

BEGIN;

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_status AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'BLOCKED',
    'DEACTIVATED'
);

CREATE TYPE product_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'INACTIVE',
    'OUT_OF_STOCK',
    'ARCHIVED'
);

CREATE TYPE product_visibility AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'HIDDEN'
);

CREATE TYPE category_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);

CREATE TYPE cart_status AS ENUM (
    'ACTIVE',
    'CONVERTED',
    'ABANDONED',
    'EXPIRED'
);

CREATE TYPE order_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'PARTIALLY_CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'FAILED'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'AUTHORIZED',
    'CAPTURED',
    'PARTIALLY_REFUNDED',
    'REFUNDED',
    'FAILED',
    'CANCELLED'
);

CREATE TYPE payment_transaction_type AS ENUM (
    'AUTHORIZATION',
    'CAPTURE',
    'SALE',
    'REFUND',
    'VOID',
    'CHARGEBACK'
);

CREATE TYPE invoice_status AS ENUM (
    'DRAFT',
    'ISSUED',
    'PAID',
    'CANCELLED',
    'REFUNDED'
);

CREATE TYPE shipment_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED'
);

CREATE TYPE inventory_movement_type AS ENUM (
    'INITIAL',
    'PURCHASE',
    'SALE',
    'RESERVATION',
    'RELEASE',
    'RETURN',
    'ADJUSTMENT',
    'DAMAGE',
    'LOSS'
);

CREATE TYPE address_type AS ENUM (
    'BILLING',
    'SHIPPING'
);

CREATE TYPE discount_type AS ENUM (
    'FIXED',
    'PERCENTAGE'
);

CREATE TYPE return_status AS ENUM (
    'REQUESTED',
    'APPROVED',
    'REJECTED',
    'PICKED_UP',
    'RECEIVED',
    'INSPECTED',
    'REFUNDED',
    'CANCELLED'
);

CREATE TYPE return_reason AS ENUM (
    'WRONG_SIZE',
    'WRONG_PRODUCT',
    'DAMAGED',
    'DEFECTIVE',
    'NOT_AS_EXPECTED',
    'CHANGED_MIND',
    'OTHER'
);

CREATE TYPE refund_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


-- ============================================================
-- COMMON updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email CITEXT NOT NULL UNIQUE,
    password_hash TEXT,

    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(30),

    status user_status NOT NULL DEFAULT 'PENDING',

    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_status
    ON users(status)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_users_phone
    ON users(phone)
    WHERE phone IS NOT NULL
      AND deleted_at IS NULL;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- RBAC
-- ============================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (role_id, permission_id),

    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(id)
        ON DELETE CASCADE
);

CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_permissions_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- ADDRESSES
-- ============================================================

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    type address_type NOT NULL DEFAULT 'SHIPPING',

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),

    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),

    landmark VARCHAR(255),

    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,

    country_code CHAR(2) NOT NULL DEFAULT 'IN',

    phone VARCHAR(30),

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_addresses_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user
    ON user_addresses(user_id)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- COLLECTIONS
--
-- Examples:
-- Men
-- Women
-- Kids
-- Summer Collection
-- New Arrivals
-- Festive Collection
-- ============================================================

CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    description TEXT,

    image_url TEXT,

    status category_status NOT NULL DEFAULT 'ACTIVE',

    sort_order INTEGER NOT NULL DEFAULT 0,

    meta_title VARCHAR(255),
    meta_description TEXT,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_status_sort
    ON collections(status, sort_order)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- CATEGORIES
--
-- Examples:
-- Shirts
-- T-Shirts
-- Jeans
-- Dresses
-- Tops
-- Kids T-Shirts
-- ============================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    parent_id UUID,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    description TEXT,

    image_url TEXT,

    status category_status NOT NULL DEFAULT 'ACTIVE',

    sort_order INTEGER NOT NULL DEFAULT 0,

    meta_title VARCHAR(255),
    meta_description TEXT,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent
    ON categories(parent_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_categories_status_sort
    ON categories(status, sort_order)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- COLLECTION <-> CATEGORY
-- ============================================================

CREATE TABLE collection_categories (
    collection_id UUID NOT NULL,
    category_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (collection_id, category_id),

    CONSTRAINT fk_collection_categories_collection
        FOREIGN KEY (collection_id)
        REFERENCES collections(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_collection_categories_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);


-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,

    description TEXT,
    short_description TEXT,

    product_type VARCHAR(100),

    status product_status NOT NULL DEFAULT 'DRAFT',
    visibility product_visibility NOT NULL DEFAULT 'PUBLIC',

    base_price NUMERIC(19,4),
    compare_at_price NUMERIC(19,4),

    currency CHAR(3) NOT NULL DEFAULT 'INR',

    tax_code VARCHAR(100),

    care_instructions TEXT,

    meta_title VARCHAR(255),
    meta_description TEXT,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_product_base_price
        CHECK (
            base_price IS NULL
            OR base_price >= 0
        ),

    CONSTRAINT chk_product_compare_price
        CHECK (
            compare_at_price IS NULL
            OR compare_at_price >= 0
        )
);

CREATE INDEX idx_products_status_visibility
    ON products(status, visibility)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_products_created_at
    ON products(created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- PRODUCT <-> CATEGORY
-- ============================================================

CREATE TABLE product_categories (
    product_id UUID NOT NULL,
    category_id UUID NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (product_id, category_id),

    CONSTRAINT fk_product_categories_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_categories_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_product_categories_category
    ON product_categories(category_id);

CREATE INDEX idx_product_categories_primary
    ON product_categories(product_id)
    WHERE is_primary = TRUE;


-- ============================================================
-- PRODUCT <-> COLLECTION
-- ============================================================

CREATE TABLE product_collections (
    product_id UUID NOT NULL,
    collection_id UUID NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (product_id, collection_id),

    CONSTRAINT fk_product_collections_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_collections_collection
        FOREIGN KEY (collection_id)
        REFERENCES collections(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_product_collections_collection
    ON product_collections(collection_id, sort_order);


-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    image_url TEXT NOT NULL,
    alt_text VARCHAR(500),

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE product_images
ADD CONSTRAINT fk_product_images_product
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE CASCADE;

CREATE INDEX idx_product_images_product
    ON product_images(product_id, sort_order);


-- ============================================================
-- PRODUCT VIDEOS
-- ============================================================

CREATE TABLE product_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    video_url TEXT NOT NULL,
    thumbnail_url TEXT,

    title VARCHAR(255),

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_videos_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);


-- ============================================================
-- ATTRIBUTES
--
-- Examples:
-- Color
-- Size
-- Fabric
-- Fit
-- Pattern
-- Neck Type
-- Sleeve Type
-- Age Group
-- Waist
-- ============================================================

CREATE TABLE attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    -- Whether this attribute can define a SKU variant
    is_variant_attribute BOOLEAN NOT NULL DEFAULT FALSE,

    -- Useful for filters on category/product listing pages
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE,

    -- Useful for displaying in product details
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_attributes_updated_at
BEFORE UPDATE ON attributes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- ATTRIBUTE VALUES
--
-- Color:
--   Black
--   White
--   Navy Blue
--
-- Size:
--   S
--   M
--   L
--   XL
--
-- Fabric:
--   Cotton
--   Linen
-- ============================================================

CREATE TABLE attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    attribute_id UUID NOT NULL,

    value VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,

    -- Optional display information
    color_hex VARCHAR(20),
    image_url TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_attribute_values_attribute
        FOREIGN KEY (attribute_id)
        REFERENCES attributes(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_attribute_value
        UNIQUE(attribute_id, slug)
);

CREATE INDEX idx_attribute_values_attribute
    ON attribute_values(attribute_id, sort_order);


-- ============================================================
-- PRODUCT ATTRIBUTE VALUES
--
-- Used for product characteristics.
--
-- Example:
--
-- Product:
-- AIRAVE Premium Cotton T-Shirt
--
-- Fabric  -> Cotton
-- Fit     -> Regular
-- Pattern -> Solid
-- ============================================================

CREATE TABLE product_attribute_values (
    product_id UUID NOT NULL,
    attribute_value_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (product_id, attribute_value_id),

    CONSTRAINT fk_product_attribute_values_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_attribute_values_value
        FOREIGN KEY (attribute_value_id)
        REFERENCES attribute_values(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_product_attribute_values_value
    ON product_attribute_values(attribute_value_id);


-- ============================================================
-- PRODUCT VARIANTS
--
-- Example:
--
-- Product:
-- AIRAVE Premium Cotton T-Shirt
--
-- Variant:
-- Black / M
-- SKU: ARV-TS-BLK-M
-- ============================================================

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    sku VARCHAR(100) NOT NULL UNIQUE,

    barcode VARCHAR(100),

    variant_name VARCHAR(255),

    price NUMERIC(19,4) NOT NULL,
    compare_at_price NUMERIC(19,4),

    cost_price NUMERIC(19,4),

    weight_grams NUMERIC(12,3),

    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_variant_price
        CHECK (price >= 0),

    CONSTRAINT chk_variant_compare_price
        CHECK (
            compare_at_price IS NULL
            OR compare_at_price >= price
        ),

    CONSTRAINT chk_variant_cost_price
        CHECK (
            cost_price IS NULL
            OR cost_price >= 0
        ),

    CONSTRAINT chk_variant_weight
        CHECK (
            weight_grams IS NULL
            OR weight_grams >= 0
        )
);

CREATE INDEX idx_product_variants_product
    ON product_variants(product_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_product_variants_barcode
    ON product_variants(barcode)
    WHERE barcode IS NOT NULL;

CREATE TRIGGER trg_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- VARIANT ATTRIBUTE VALUES
--
-- Example:
--
-- Variant: ARV-TS-BLK-M
--
-- Color -> Black
-- Size  -> M
-- ============================================================

CREATE TABLE variant_attribute_values (
    variant_id UUID NOT NULL,
    attribute_value_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (variant_id, attribute_value_id),

    CONSTRAINT fk_variant_attribute_values_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_variant_attribute_values_value
        FOREIGN KEY (attribute_value_id)
        REFERENCES attribute_values(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_variant_attribute_values_value
    ON variant_attribute_values(attribute_value_id);


-- ============================================================
-- VARIANT IMAGES
-- ============================================================

CREATE TABLE variant_images (
    variant_id UUID NOT NULL,
    image_id UUID NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (variant_id, image_id),

    CONSTRAINT fk_variant_images_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_variant_images_image
        FOREIGN KEY (image_id)
        REFERENCES product_images(id)
        ON DELETE CASCADE
);


-- ============================================================
-- PRICE HISTORY
-- ============================================================

CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    variant_id UUID NOT NULL,

    price NUMERIC(19,4) NOT NULL,
    compare_at_price NUMERIC(19,4),

    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,

    changed_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_price_history_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_price_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_price_history_price
        CHECK (price >= 0)
);

CREATE INDEX idx_price_history_variant
    ON price_history(variant_id, valid_from DESC);


-- ============================================================
-- INVENTORY
-- ============================================================

CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    variant_id UUID NOT NULL UNIQUE,

    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,

    reorder_level INTEGER NOT NULL DEFAULT 0,

    version BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inventories_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_inventory_on_hand
        CHECK (quantity_on_hand >= 0),

    CONSTRAINT chk_inventory_reserved
        CHECK (
            quantity_reserved >= 0
            AND quantity_reserved <= quantity_on_hand
        ),

    CONSTRAINT chk_inventory_reorder
        CHECK (reorder_level >= 0)
);

CREATE INDEX idx_inventory_available
    ON inventories(variant_id)
    WHERE quantity_on_hand > quantity_reserved;

CREATE TRIGGER trg_inventories_updated_at
BEFORE UPDATE ON inventories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- INVENTORY MOVEMENTS
-- ============================================================

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    variant_id UUID NOT NULL,

    movement_type inventory_movement_type NOT NULL,

    quantity INTEGER NOT NULL,

    reference_type VARCHAR(100),
    reference_id UUID,

    notes TEXT,

    created_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inventory_movements_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_movements_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_inventory_movement_quantity
        CHECK (quantity <> 0)
);

CREATE INDEX idx_inventory_movements_variant
    ON inventory_movements(variant_id, created_at DESC);

CREATE INDEX idx_inventory_movements_reference
    ON inventory_movements(reference_type, reference_id);


-- ============================================================
-- INVENTORY RESERVATIONS
--
-- Used during checkout/payment window.
-- ============================================================

CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    variant_id UUID NOT NULL,

    cart_id UUID,
    order_id UUID,

    quantity INTEGER NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    released_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inventory_reservations_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_inventory_reservation_quantity
        CHECK (quantity > 0)
);

CREATE INDEX idx_inventory_reservations_variant
    ON inventory_reservations(variant_id);

CREATE INDEX idx_inventory_reservations_expiry
    ON inventory_reservations(expires_at)
    WHERE released_at IS NULL;


-- ============================================================
-- WISHLISTS
-- ============================================================

CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL DEFAULT 'My Wishlist',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE wishlist_items (
    wishlist_id UUID NOT NULL,
    product_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (wishlist_id, product_id),

    CONSTRAINT fk_wishlist_items_wishlist
        FOREIGN KEY (wishlist_id)
        REFERENCES wishlists(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

CREATE TRIGGER trg_wishlists_updated_at
BEFORE UPDATE ON wishlists
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- CARTS
--
-- Supports:
-- 1. Logged-in users
-- 2. Guest users
-- ============================================================

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID,

    guest_token UUID UNIQUE,

    status cart_status NOT NULL DEFAULT 'ACTIVE',

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_cart_owner
        CHECK (
            user_id IS NOT NULL
            OR guest_token IS NOT NULL
        )
);

CREATE UNIQUE INDEX uq_active_user_cart
    ON carts(user_id)
    WHERE status = 'ACTIVE'
      AND user_id IS NOT NULL;

CREATE INDEX idx_carts_guest_token
    ON carts(guest_token)
    WHERE guest_token IS NOT NULL;

CREATE TRIGGER trg_carts_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- CART ITEMS
-- ============================================================

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cart_id UUID NOT NULL,
    variant_id UUID NOT NULL,

    quantity INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_cart_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT uq_cart_variant
        UNIQUE(cart_id, variant_id)
);

CREATE INDEX idx_cart_items_variant
    ON cart_items(variant_id);

CREATE TRIGGER trg_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_number VARCHAR(50) NOT NULL UNIQUE,

    user_id UUID,

    status order_status NOT NULL DEFAULT 'PENDING',

    currency CHAR(3) NOT NULL DEFAULT 'INR',

    subtotal NUMERIC(19,4) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(19,4) NOT NULL DEFAULT 0,
    shipping_amount NUMERIC(19,4) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_amount NUMERIC(19,4) NOT NULL DEFAULT 0,

    customer_email CITEXT,
    customer_phone VARCHAR(30),

    notes TEXT,

    placed_at TIMESTAMPTZ,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_order_amounts
        CHECK (
            subtotal >= 0
            AND discount_amount >= 0
            AND shipping_amount >= 0
            AND tax_amount >= 0
            AND total_amount >= 0
        )
);

CREATE INDEX idx_orders_user
    ON orders(user_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_orders_status
    ON orders(status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_orders_customer_email
    ON orders(customer_email);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- ORDER ADDRESSES
--
-- Snapshot of customer address at checkout.
-- ============================================================

CREATE TABLE order_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    type address_type NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),

    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),

    landmark VARCHAR(255),

    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,

    country_code CHAR(2) NOT NULL DEFAULT 'IN',

    phone VARCHAR(30),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_addresses_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_order_address_type
        UNIQUE(order_id, type)
);


-- ============================================================
-- ORDER ITEMS
--
-- IMPORTANT:
-- Product information is SNAPSHOTTED here.
-- ============================================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    variant_id UUID,

    sku VARCHAR(100) NOT NULL,

    product_name VARCHAR(500) NOT NULL,
    variant_name VARCHAR(255),

    quantity INTEGER NOT NULL,

    unit_price NUMERIC(19,4) NOT NULL,

    discount_amount NUMERIC(19,4) NOT NULL DEFAULT 0,

    tax_amount NUMERIC(19,4) NOT NULL DEFAULT 0,

    total_amount NUMERIC(19,4) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_order_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_item_amounts
        CHECK (
            unit_price >= 0
            AND discount_amount >= 0
            AND tax_amount >= 0
            AND total_amount >= 0
        )
);

CREATE INDEX idx_order_items_order
    ON order_items(order_id);

CREATE INDEX idx_order_items_variant
    ON order_items(variant_id);


-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    old_status order_status,
    new_status order_status NOT NULL,

    changed_by UUID,

    reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_status_history_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_status_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_order_status_history_order
    ON order_status_history(order_id, created_at DESC);


-- ============================================================
-- SHIPMENTS
-- ============================================================

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    status shipment_status NOT NULL DEFAULT 'PENDING',

    carrier VARCHAR(100),

    tracking_number VARCHAR(255),
    tracking_url TEXT,

    shipping_method VARCHAR(100),

    estimated_delivery_at TIMESTAMPTZ,

    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_shipments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_shipments_order
    ON shipments(order_id);

CREATE INDEX idx_shipments_tracking
    ON shipments(tracking_number)
    WHERE tracking_number IS NOT NULL;

CREATE TRIGGER trg_shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- SHIPMENT ITEMS
-- ============================================================

CREATE TABLE shipment_items (
    shipment_id UUID NOT NULL,
    order_item_id UUID NOT NULL,

    quantity INTEGER NOT NULL,

    PRIMARY KEY (shipment_id, order_item_id),

    CONSTRAINT fk_shipment_items_shipment
        FOREIGN KEY (shipment_id)
        REFERENCES shipments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shipment_items_order_item
        FOREIGN KEY (order_item_id)
        REFERENCES order_items(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_shipment_quantity
        CHECK (quantity > 0)
);


-- ============================================================
-- SHIPMENT STATUS HISTORY
-- ============================================================

CREATE TABLE shipment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    shipment_id UUID NOT NULL,

    old_status shipment_status,
    new_status shipment_status NOT NULL,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_shipment_status_history_shipment
        FOREIGN KEY (shipment_id)
        REFERENCES shipments(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_shipment_status_history
    ON shipment_status_history(shipment_id, created_at DESC);


-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    provider VARCHAR(100) NOT NULL,

    provider_payment_id VARCHAR(255),

    status payment_status NOT NULL DEFAULT 'PENDING',

    currency CHAR(3) NOT NULL,

    amount NUMERIC(19,4) NOT NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,

    failure_code VARCHAR(100),
    failure_message TEXT,

    authorized_at TIMESTAMPTZ,
    captured_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0)
);

CREATE INDEX idx_payments_order
    ON payments(order_id);

CREATE UNIQUE INDEX uq_payment_provider_id
    ON payments(provider, provider_payment_id)
    WHERE provider_payment_id IS NOT NULL;

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- PAYMENT TRANSACTIONS
-- ============================================================

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    payment_id UUID NOT NULL,

    transaction_type payment_transaction_type NOT NULL,

    provider_transaction_id VARCHAR(255),

    amount NUMERIC(19,4) NOT NULL,

    currency CHAR(3) NOT NULL,

    status payment_status NOT NULL,

    gateway_response JSONB NOT NULL DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payment_transactions_payment
        FOREIGN KEY (payment_id)
        REFERENCES payments(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_payment_transaction_amount
        CHECK (amount >= 0)
);

CREATE INDEX idx_payment_transactions_payment
    ON payment_transactions(payment_id, created_at DESC);

CREATE UNIQUE INDEX uq_provider_transaction_id
    ON payment_transactions(provider_transaction_id)
    WHERE provider_transaction_id IS NOT NULL;


-- ============================================================
-- INVOICES
-- ============================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL UNIQUE,

    invoice_number VARCHAR(100) NOT NULL UNIQUE,

    status invoice_status NOT NULL DEFAULT 'DRAFT',

    currency CHAR(3) NOT NULL DEFAULT 'INR',

    subtotal NUMERIC(19,4) NOT NULL,
    tax_amount NUMERIC(19,4) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_amount NUMERIC(19,4) NOT NULL,

    issued_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,

    pdf_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_invoices_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT
);

CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- PRODUCT REVIEWS
-- ============================================================

CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    variant_id UUID,

    user_id UUID NOT NULL,

    order_item_id UUID,

    rating SMALLINT NOT NULL,

    title VARCHAR(255),
    body TEXT,

    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_reviews_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_reviews_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_product_reviews_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_reviews_order_item
        FOREIGN KEY (order_item_id)
        REFERENCES order_items(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_product_review_rating
        CHECK (rating BETWEEN 1 AND 5)
);

CREATE UNIQUE INDEX uq_user_product_review
    ON product_reviews(user_id, product_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_product_reviews_product
    ON product_reviews(product_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_product_reviews_updated_at
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- REVIEW IMAGES
-- ============================================================

CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    review_id UUID NOT NULL,

    image_url TEXT NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_review_images_review
        FOREIGN KEY (review_id)
        REFERENCES product_reviews(id)
        ON DELETE CASCADE
);


-- ============================================================
-- COUPONS
-- ============================================================

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    discount_type discount_type NOT NULL,

    discount_value NUMERIC(19,4) NOT NULL,

    minimum_order_amount NUMERIC(19,4),

    maximum_discount_amount NUMERIC(19,4),

    usage_limit INTEGER,

    usage_limit_per_user INTEGER,

    used_count INTEGER NOT NULL DEFAULT 0,

    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_coupon_discount
        CHECK (discount_value > 0),

    CONSTRAINT chk_coupon_percentage
        CHECK (
            discount_type <> 'PERCENTAGE'
            OR discount_value <= 100
        ),

    CONSTRAINT chk_coupon_usage
        CHECK (
            usage_limit IS NULL
            OR usage_limit >= 0
        )
);

CREATE INDEX idx_coupons_active
    ON coupons(is_active, starts_at, expires_at);

CREATE TRIGGER trg_coupons_updated_at
BEFORE UPDATE ON coupons
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- COUPON PRODUCTS
-- ============================================================

CREATE TABLE coupon_products (
    coupon_id UUID NOT NULL,
    product_id UUID NOT NULL,

    PRIMARY KEY (coupon_id, product_id),

    CONSTRAINT fk_coupon_products_coupon
        FOREIGN KEY (coupon_id)
        REFERENCES coupons(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coupon_products_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);


-- ============================================================
-- COUPON CATEGORIES
-- ============================================================

CREATE TABLE coupon_categories (
    coupon_id UUID NOT NULL,
    category_id UUID NOT NULL,

    PRIMARY KEY (coupon_id, category_id),

    CONSTRAINT fk_coupon_categories_coupon
        FOREIGN KEY (coupon_id)
        REFERENCES coupons(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coupon_categories_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);


-- ============================================================
-- COUPON USAGES
-- ============================================================

CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    coupon_id UUID NOT NULL,
    user_id UUID,
    order_id UUID NOT NULL,

    discount_amount NUMERIC(19,4) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_coupon_usages_coupon
        FOREIGN KEY (coupon_id)
        REFERENCES coupons(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_coupon_usages_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_coupon_usages_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_coupon_user_order
    ON coupon_usages(coupon_id, user_id, order_id);


-- ============================================================
-- RETURNS
-- ============================================================

CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,
    user_id UUID,

    status return_status NOT NULL DEFAULT 'REQUESTED',

    reason return_reason NOT NULL,

    customer_note TEXT,
    admin_note TEXT,

    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_returns_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_returns_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_returns_order
    ON returns(order_id);

CREATE INDEX idx_returns_status
    ON returns(status);

CREATE TRIGGER trg_returns_updated_at
BEFORE UPDATE ON returns
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- RETURN ITEMS
-- ============================================================

CREATE TABLE return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    return_id UUID NOT NULL,
    order_item_id UUID NOT NULL,

    quantity INTEGER NOT NULL,

    reason return_reason NOT NULL,

    condition_note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_return_items_return
        FOREIGN KEY (return_id)
        REFERENCES returns(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_return_items_order_item
        FOREIGN KEY (order_item_id)
        REFERENCES order_items(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_return_quantity
        CHECK (quantity > 0)
);


-- ============================================================
-- REFUNDS
-- ============================================================

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    payment_id UUID,

    return_id UUID,

    amount NUMERIC(19,4) NOT NULL,

    currency CHAR(3) NOT NULL DEFAULT 'INR',

    status refund_status NOT NULL DEFAULT 'PENDING',

    provider_refund_id VARCHAR(255),

    reason TEXT,

    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refunds_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_refunds_payment
        FOREIGN KEY (payment_id)
        REFERENCES payments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_refunds_return
        FOREIGN KEY (return_id)
        REFERENCES returns(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_refund_amount
        CHECK (amount > 0)
);

CREATE UNIQUE INDEX uq_provider_refund
    ON refunds(provider_refund_id)
    WHERE provider_refund_id IS NOT NULL;

CREATE TRIGGER trg_refunds_updated_at
BEFORE UPDATE ON refunds
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID,

    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,

    action VARCHAR(100) NOT NULL,

    old_values JSONB,
    new_values JSONB,

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_entity
    ON audit_logs(entity_type, entity_id, created_at DESC);

CREATE INDEX idx_audit_logs_user
    ON audit_logs(user_id, created_at DESC);


-- ============================================================
-- SEED ROLES
-- ============================================================

INSERT INTO roles (name, description)
VALUES
    ('CUSTOMER', 'AIRAVE customer'),
    ('ADMIN', 'AIRAVE administrator'),
    ('SUPER_ADMIN', 'AIRAVE super administrator')
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- SEED COMMON CLOTHING ATTRIBUTES
-- ============================================================

INSERT INTO attributes (
    name,
    slug,
    is_variant_attribute,
    is_filterable,
    is_visible,
    sort_order
)
VALUES
    ('Color', 'color', TRUE, TRUE, TRUE, 1),
    ('Size', 'size', TRUE, TRUE, TRUE, 2),
    ('Fabric', 'fabric', FALSE, TRUE, TRUE, 3),
    ('Fit', 'fit', FALSE, TRUE, TRUE, 4),
    ('Pattern', 'pattern', FALSE, TRUE, TRUE, 5),
    ('Neck Type', 'neck-type', FALSE, TRUE, TRUE, 6),
    ('Sleeve Type', 'sleeve-type', FALSE, TRUE, TRUE, 7),
    ('Age Group', 'age-group', FALSE, TRUE, TRUE, 8),
    ('Waist', 'waist', TRUE, TRUE, TRUE, 9)
ON CONFLICT (slug) DO NOTHING;


COMMIT;