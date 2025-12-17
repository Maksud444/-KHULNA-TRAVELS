-- Payment Integration Database Schema for Khulna Travels (bKash + SSLCommerz)

-- 1. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    booking_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BDT',
    payment_method ENUM('bkash', 'sslcommerz', 'nagad', 'rocket', 'cash') NOT NULL,
    
    -- Payment Status
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    
    -- Gateway Specific
    gateway_transaction_id VARCHAR(100),
    gateway_invoice_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    
    -- Customer Info
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    
    -- Payment Response
    payment_response JSON,
    callback_response JSON,
    
    -- Timestamps
    payment_initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Payment Logs Table
CREATE TABLE IF NOT EXISTS payment_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    
    -- Log Details
    log_type ENUM('request', 'response', 'callback', 'webhook', 'error') NOT NULL,
    log_message TEXT,
    log_data JSON,
    
    -- Gateway Info
    gateway VARCHAR(20),
    endpoint VARCHAR(200),
    http_method VARCHAR(10),
    http_status INT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payment_id (payment_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_log_type (log_type),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    
    -- Refund Details
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_reason TEXT,
    refund_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    
    -- Gateway Info
    gateway_refund_id VARCHAR(100),
    gateway_response JSON,
    
    -- Admin Info
    processed_by VARCHAR(50),
    
    -- Timestamps
    refund_requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refund_completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_payment_id (payment_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_refund_status (refund_status),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Payment Gateway Config Table
CREATE TABLE IF NOT EXISTS payment_gateway_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gateway_name VARCHAR(50) UNIQUE NOT NULL,
    
    -- Config
    is_active BOOLEAN DEFAULT true,
    is_sandbox BOOLEAN DEFAULT true,
    
    -- Credentials (Encrypted in production)
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    merchant_id VARCHAR(100),
    store_id VARCHAR(100),
    store_password VARCHAR(255),
    
    -- Settings
    config_data JSON,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Gateway Configs (Sandbox)
INSERT INTO payment_gateway_config (gateway_name, is_active, is_sandbox, config_data) VALUES
('bkash', true, true, '{"app_key": "sandbox_app_key", "app_secret": "sandbox_app_secret", "username": "sandbox_username", "password": "sandbox_password"}'),
('sslcommerz', true, true, '{"store_id": "testbox", "store_password": "testbox"}'),
('nagad', false, true, '{}'),
('rocket', false, true, '{}');

-- Sample Data for Testing
INSERT INTO payments (transaction_id, booking_id, user_id, amount, payment_method, status, customer_name, customer_phone) VALUES
('TXN20241215001', 'BK2024120001', 'CUST001', 1740.00, 'bkash', 'completed', 'রহিম আহমেদ', '01712345678'),
('TXN20241215002', 'BK2024120002', 'CUST002', 870.00, 'sslcommerz', 'completed', 'ফাতেমা খাতুন', '01823456789'),
('TXN20241215003', 'BK2024120003', 'CUST001', 1950.00, 'bkash', 'pending', 'করিম মিয়া', '01934567890');
