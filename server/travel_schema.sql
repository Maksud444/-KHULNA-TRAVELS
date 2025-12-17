-- MySQL schema for Khulna Travels
-- Run in MySQL 5.7+ or 8.0+

CREATE DATABASE IF NOT EXISTS khulna_travels CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE khulna_travels;

-- Roles: admin, counter_staff, user, supervisor
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- Counters (physical sales counters)
CREATE TABLE IF NOT EXISTS counters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  contact_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Buses and Coaches (a bus may have multiple coaches)
CREATE TABLE IF NOT EXISTS buses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  registration VARCHAR(100),
  supervisor_contact VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coaches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  total_seats INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seats per coach
CREATE TABLE IF NOT EXISTS seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coach_id INT NOT NULL,
  seat_number VARCHAR(20) NOT NULL,
  seat_type ENUM('regular','window','aisle','sleeper') DEFAULT 'regular',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
  UNIQUE (coach_id, seat_number)
) ENGINE=InnoDB;

-- Schedule of trips
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coach_id INT NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  departure DATETIME NOT NULL,
  arrival DATETIME,
  fare DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('scheduled','cancelled','rescheduled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Discounts (can be applied by counter staff)
CREATE TABLE IF NOT EXISTS discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  description VARCHAR(255),
  amount DECIMAL(10,2) DEFAULT 0.00,
  percent INT DEFAULT 0,
  valid_from DATETIME,
  valid_to DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(64) NOT NULL UNIQUE,
  user_id INT,
  counter_id INT,
  schedule_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_id INT,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('pending','confirmed','cancel_requested','cancelled','refunded','completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE SET NULL,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (discount_id) REFERENCES discounts(id)
) ENGINE=InnoDB;

-- Booking seats (one row per seat booked)
CREATE TABLE IF NOT EXISTS booking_seats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  seat_id INT NOT NULL,
  coach_id INT NOT NULL,
  seat_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  supervisor_tip DECIMAL(10,2) DEFAULT 0.00,
  assigned_by INT, -- staff id who assigned seat (counter staff)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE RESTRICT,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  payment_gateway VARCHAR(100),
  transaction_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('initiated','success','failed','refunded') DEFAULT 'initiated',
  paid_at TIMESTAMP NULL,
  refund_reason TEXT,
  refund_authorized_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (refund_authorized_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Ticket records (final printable ticket rows)
CREATE TABLE IF NOT EXISTS tickets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  ticket_number VARCHAR(128) NOT NULL UNIQUE,
  seat_id INT NOT NULL,
  coach_id INT NOT NULL,
  issued_by INT, -- counter staff id
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_path VARCHAR(512), -- optional path to generated ticket PDF
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cancellation requests requiring approval
CREATE TABLE IF NOT EXISTS cancellation_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  requested_by INT,
  reason TEXT,
  status ENUM('pending','approved','rejected','processed') DEFAULT 'pending',
  processed_by INT,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Admin audit logs (simple)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Some sample seed rows for roles
INSERT INTO roles (name) VALUES ('admin') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (name) VALUES ('counter_staff') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (name) VALUES ('user') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (name) VALUES ('supervisor') ON DUPLICATE KEY UPDATE name=name;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_counter ON bookings(counter_id);
CREATE INDEX IF NOT EXISTS idx_schedules_coach ON schedules(coach_id);

COMMIT;
