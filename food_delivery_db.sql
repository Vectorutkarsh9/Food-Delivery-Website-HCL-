-- ============================================================
-- ONLINE FOOD DELIVERY SYSTEM - DATABASE SCHEMA
-- Version   : 1.0
-- Database  : food_delivery_db
-- Created   : 2025
-- ============================================================

CREATE DATABASE IF NOT EXISTS food_delivery_db;
USE food_delivery_db;

-- ============================================================
-- TABLE 1: admins
-- ============================================================
CREATE TABLE admins (
    id              INT             NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE 2: customers
-- ============================================================
CREATE TABLE customers (
    id              INT             NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     NULL,
    address         TEXT            NULL,
    city            VARCHAR(100)    NULL,
    pincode         VARCHAR(10)     NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_customers_email (email),
    INDEX idx_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE 3: categories
-- ============================================================
CREATE TABLE categories (
    id              INT             NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    description     TEXT            NULL,
    image_url       VARCHAR(500)    NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    display_order   INT             NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_categories_name          (name),
    INDEX idx_categories_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE 4: food_items
-- ============================================================
CREATE TABLE food_items (
    id                      INT             NOT NULL AUTO_INCREMENT,
    category_id             INT             NOT NULL,
    name                    VARCHAR(150)    NOT NULL,
    description             TEXT            NULL,
    price                   DECIMAL(10,2)   NOT NULL,
    discount_price          DECIMAL(10,2)   NULL,
    image_url               VARCHAR(500)    NULL,
    is_vegetarian           TINYINT(1)      NOT NULL DEFAULT 0,
    is_vegan                TINYINT(1)      NOT NULL DEFAULT 0,
    is_available            TINYINT(1)      NOT NULL DEFAULT 1,
    rating                  DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
    total_reviews           INT             NOT NULL DEFAULT 0,
    preparation_time_mins   INT             NOT NULL DEFAULT 15,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_food_items_category
        FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX idx_food_items_category  (category_id),
    INDEX idx_food_items_available (is_available),
    INDEX idx_food_items_price     (price),
    INDEX idx_food_items_rating    (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE 5: orders
-- ============================================================
CREATE TABLE orders (
    id                      INT             NOT NULL AUTO_INCREMENT,
    customer_id             INT             NOT NULL,
    order_number            VARCHAR(20)     NOT NULL UNIQUE,
    status                  ENUM(
                                'Pending',
                                'Confirmed',
                                'Preparing',
                                'OutForDelivery',
                                'Delivered',
                                'Cancelled'
                            )               NOT NULL DEFAULT 'Pending',
    payment_method          ENUM(
                                'CashOnDelivery',
                                'UPI',
                                'Card',
                                'NetBanking'
                            )               NOT NULL DEFAULT 'CashOnDelivery',
    payment_status          ENUM(
                                'Pending',
                                'Paid',
                                'Failed',
                                'Refunded'
                            )               NOT NULL DEFAULT 'Pending',
    subtotal                DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    delivery_charge         DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    discount_amount         DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    total_amount            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    delivery_address        TEXT            NOT NULL,
    delivery_city           VARCHAR(100)    NOT NULL,
    delivery_pincode        VARCHAR(10)     NOT NULL,
    delivery_phone          VARCHAR(20)     NOT NULL,
    special_instructions    TEXT            NULL,
    estimated_delivery      DATETIME        NULL,
    delivered_at            DATETIME        NULL,
    cancelled_at            DATETIME        NULL,
    cancellation_reason     VARCHAR(255)    NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX idx_orders_customer       (customer_id),
    INDEX idx_orders_status         (status),
    INDEX idx_orders_payment_status (payment_status),
    INDEX idx_orders_order_number   (order_number),
    INDEX idx_orders_created_at     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE 6: order_items
-- ============================================================
CREATE TABLE order_items (
    id              INT             NOT NULL AUTO_INCREMENT,
    order_id        INT             NOT NULL,
    food_item_id    INT             NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2)   NOT NULL,
    discount_price  DECIMAL(10,2)   NULL,
    total_price     DECIMAL(10,2)   NOT NULL,
    special_request VARCHAR(255)    NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_food
        FOREIGN KEY (food_item_id)
        REFERENCES food_items (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_food  (food_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE 7: order_status_history
-- ============================================================
CREATE TABLE order_status_history (
    id          INT             NOT NULL AUTO_INCREMENT,
    order_id    INT             NOT NULL,
    status      ENUM(
                    'Pending',
                    'Confirmed',
                    'Preparing',
                    'OutForDelivery',
                    'Delivered',
                    'Cancelled'
                )               NOT NULL,
    changed_by  ENUM(
                    'System',
                    'Admin',
                    'Customer'
                )               NOT NULL DEFAULT 'System',
    remarks     VARCHAR(255)    NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_status_history_order
        FOREIGN KEY (order_id)
        REFERENCES orders (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_status_history_order  (order_id),
    INDEX idx_status_history_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE 8: reviews
-- ============================================================
CREATE TABLE reviews (
    id              INT             NOT NULL AUTO_INCREMENT,
    customer_id     INT             NOT NULL,
    food_item_id    INT             NOT NULL,
    order_id        INT             NOT NULL,
    rating          TINYINT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT            NULL,
    is_approved     TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_reviews_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_food
        FOREIGN KEY (food_item_id)
        REFERENCES food_items (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_order
        FOREIGN KEY (order_id)
        REFERENCES orders (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE INDEX idx_reviews_unique (customer_id, food_item_id, order_id),
    INDEX idx_reviews_food          (food_item_id),
    INDEX idx_reviews_rating        (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SEED DATA: categories
-- ============================================================
INSERT INTO categories (name, description, image_url, display_order) VALUES
('Starters',    'Appetizers and snacks',        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400', 1),
('Main Course', 'Full meals and main dishes',   'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', 2),
('Pizza',       'Classic and gourmet pizzas',   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 3),
('Burgers',     'Juicy burgers and sandwiches', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 4),
('Desserts',    'Sweets and frozen treats',     'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', 5),
('Beverages',   'Cold drinks, juices, shakes',  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 6);


-- ============================================================
-- SEED DATA: food_items
-- ============================================================
INSERT INTO food_items
    (category_id, name, description, price, discount_price, image_url, is_vegetarian, is_vegan, is_available, preparation_time_mins)
VALUES
-- Starters
(1, 'Veg Spring Rolls',
    'Crispy golden rolls stuffed with fresh vegetables and spices',
    120.00, 99.00,
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    1, 1, 1, 10),

(1, 'Chicken Wings',
    'Spicy marinated grilled chicken wings with dipping sauce',
    180.00, NULL,
    'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400',
    0, 0, 1, 15),

-- Main Course
(2, 'Paneer Butter Masala',
    'Soft cottage cheese cubes in rich creamy tomato gravy',
    220.00, 199.00,
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    1, 0, 1, 20),

(2, 'Chicken Biryani',
    'Aromatic basmati rice layered with spiced chicken and saffron',
    280.00, NULL,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    0, 0, 1, 30),

-- Pizza
(3, 'Margherita Pizza',
    'Classic Italian pizza with fresh tomato sauce and mozzarella',
    299.00, 249.00,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    1, 0, 1, 20),

(3, 'Pepperoni Pizza',
    'Loaded with premium pepperoni slices on a rich tomato base',
    349.00, NULL,
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    0, 0, 1, 20),

-- Burgers
(4, 'Veg Burger',
    'Crispy veggie patty with lettuce, tomato and special sauce',
    149.00, 129.00,
    'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
    1, 0, 1, 10),

(4, 'Chicken Zinger',
    'Spicy crispy fried chicken fillet in a toasted sesame bun',
    199.00, NULL,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    0, 0, 1, 12),

-- Desserts
(5, 'Chocolate Lava Cake',
    'Warm chocolate sponge with a gooey molten chocolate center',
    149.00, NULL,
    'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
    1, 0, 1, 15),

-- Beverages
(6, 'Mango Shake',
    'Thick and creamy fresh mango milkshake blended to perfection',
    99.00, 79.00,
    'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
    1, 0, 1, 5);


-- ============================================================
-- SEED DATA: admins
-- ============================================================
INSERT INTO admins (name, email, password_hash, phone, is_active) VALUES
('Super Admin', 'admin@fooddelivery.com', 'hashed_password_here', '9999999999', 1);


-- ============================================================
-- END OF SCHEMA
-- ============================================================
