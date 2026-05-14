-- Naxora Database Schema
-- Compatible with MySQL/MariaDB

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('MEMBER', 'ADMIN') DEFAULT 'MEMBER',
    tier ENUM('REGULAR', 'VIP') DEFAULT 'REGULAR',
    balance_nx DECIMAL(20, 8) DEFAULT 0,
    balance_idr DECIMAL(20, 2) DEFAULT 0,
    referral_code VARCHAR(10) UNIQUE NOT NULL,
    referred_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('BASIC', 'MEDIUM', 'PRO') NOT NULL,
    price_nx DECIMAL(20, 8) NOT NULL,
    reward_per_mining DECIMAL(20, 8) NOT NULL,
    mining_per_day INT NOT NULL,
    cooldown_minutes INT NOT NULL,
    duration_days INT NOT NULL,
    image_url TEXT,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
);

CREATE TABLE user_products (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NOT NULL,
    mining_count_today INT DEFAULT 0,
    last_mining_date TIMESTAMP NULL,
    status ENUM('ACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE mining_sessions (
    id CHAR(36) PRIMARY KEY,
    user_product_id CHAR(36) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status ENUM('MINING', 'READY_TO_CLAIM', 'CLAIMED') DEFAULT 'MINING',
    reward_amount DECIMAL(20, 8) NOT NULL,
    FOREIGN KEY (user_product_id) REFERENCES user_products(id)
);

CREATE TABLE transactions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    type ENUM('DEPOSIT', 'WITHDRAW', 'BONUS', 'CONVERT', 'INVEST', 'MINING') NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency ENUM('NX', 'IDR') NOT NULL,
    description TEXT,
    status ENUM('PENDING', 'SUCCESS', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nx_to_idr DECIMAL(20, 2) DEFAULT 7000.00,
    min_deposit DECIMAL(20, 2) DEFAULT 10000.00,
    min_withdraw DECIMAL(20, 2) DEFAULT 50000.00,
    withdraw_fee DECIMAL(20, 2) DEFAULT 2500.00,
    maintenance BOOLEAN DEFAULT FALSE,
    wa_admin VARCHAR(20),
    tg_admin VARCHAR(50)
);

-- Initial Data
INSERT INTO settings (nx_to_idr, min_deposit, min_withdraw, withdraw_fee, wa_admin, tg_admin) 
VALUES (7000, 10000, 50000, 2500, '628123456789', '@naxora_admin');
