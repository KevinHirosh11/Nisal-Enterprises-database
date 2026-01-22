-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 22, 2026 at 02:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nisal_db`
--
CREATE DATABASE IF NOT EXISTS `nisal_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `nisal_db`;

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
CREATE TABLE `bills` (
  `bill_id` int(11) NOT NULL,
  `bill_date` date NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bills`
--

INSERT INTO `bills` (`bill_id`, `bill_date`, `customer_id`, `total_amount`, `paid_amount`, `balance`) VALUES
(3, '0000-00-00', NULL, 200000.00, 500000.00, -300000.00),
(4, '0000-00-00', NULL, 200000.00, 500000.00, -300000.00),
(5, '0000-00-00', NULL, 250000.00, 0.00, 250000.00),
(6, '0000-00-00', NULL, 40000.00, 0.00, 40000.00),
(7, '0000-00-00', NULL, 40000.00, 10000.00, 30000.00),
(8, '0000-00-00', NULL, 40000.00, 0.00, 40000.00),
(9, '0000-00-00', NULL, 40000.00, 50000.00, -10000.00),
(10, '0000-00-00', NULL, 4275.00, 5000.00, -725.00);

-- --------------------------------------------------------

--
-- Table structure for table `bill_items`
--

DROP TABLE IF EXISTS `bill_items`;
CREATE TABLE `bill_items` (
  `bill_item_id` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bill_items`
--

INSERT INTO `bill_items` (`bill_item_id`, `bill_id`, `product_id`, `quantity`, `price`, `discount`, `total`) VALUES
(3, 3, 5, 5, 40000.00, 0.00, 200000.00),
(4, 4, 5, 5, 40000.00, 0.00, 200000.00),
(5, 5, 6, 1, 250000.00, 0.00, 250000.00),
(6, 6, 5, 1, 40000.00, 0.00, 40000.00),
(7, 7, 5, 1, 40000.00, 0.00, 40000.00),
(8, 8, 5, 1, 40000.00, 0.00, 40000.00),
(9, 9, 5, 1, 40000.00, 0.00, 40000.00),
(10, 10, 10, 3, 1500.00, 5.00, 4275.00);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `installments`
--

DROP TABLE IF EXISTS `installments`;
CREATE TABLE `installments` (
  `installment_id` int(11) NOT NULL,
  `bill_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `initial_payment` decimal(10,2) DEFAULT NULL,
  `remaining_amount` decimal(10,2) DEFAULT NULL,
  `installment_count` int(11) DEFAULT NULL,
  `per_installment` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `installments`
--

INSERT INTO `installments` (`installment_id`, `bill_id`, `customer_name`, `phone`, `initial_payment`, `remaining_amount`, `installment_count`, `per_installment`) VALUES
(3, 9, 'adgasfg', '135345363', 10000.00, 30000.00, 10, 3000.00);

-- --------------------------------------------------------

--
-- Table structure for table `installment_schedule`
--

DROP TABLE IF EXISTS `installment_schedule`;
CREATE TABLE `installment_schedule` (
  `schedule_id` int(11) NOT NULL,
  `installment_id` int(11) NOT NULL,
  `installment_no` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `paid` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `installment_schedule`
--

INSERT INTO `installment_schedule` (`schedule_id`, `installment_id`, `installment_no`, `amount`, `due_date`, `paid`, `created_at`) VALUES
(1, 3, 1, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(2, 3, 2, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(3, 3, 3, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(4, 3, 4, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(5, 3, 5, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(6, 3, 6, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(7, 3, 7, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(8, 3, 8, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(9, 3, 9, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29'),
(10, 3, 10, 3000.00, '2026-01-22', 0, '2026-01-22 12:46:29');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `category`, `price`, `quantity`, `created_at`) VALUES
(5, 'JBL', 'speaker', 40000.00, 35, '2026-01-20 13:28:36'),
(6, 'cupboard', 'Singer', 250000.00, 4, '2026-01-20 13:29:02'),
(9, 'clock', 'light clock', 1000.00, 30, '2026-01-22 13:26:42'),
(10, 'umbrellla', 'short size', 1500.00, 17, '2026-01-22 13:30:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD PRIMARY KEY (`bill_item_id`),
  ADD KEY `bill_id` (`bill_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `installments`
--
ALTER TABLE `installments`
  ADD PRIMARY KEY (`installment_id`),
  ADD KEY `bill_id` (`bill_id`);

--
-- Indexes for table `installment_schedule`
--
ALTER TABLE `installment_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `installment_id` (`installment_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bills`
--
ALTER TABLE `bills`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `bill_items`
--
ALTER TABLE `bill_items`
  MODIFY `bill_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `installments`
--
ALTER TABLE `installments`
  MODIFY `installment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `installment_schedule`
--
ALTER TABLE `installment_schedule`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`);

--
-- Constraints for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD CONSTRAINT `bill_items_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`),
  ADD CONSTRAINT `bill_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `installments`
--
ALTER TABLE `installments`
  ADD CONSTRAINT `installments_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`);

--
-- Constraints for table `installment_schedule`
--
ALTER TABLE `installment_schedule`
  ADD CONSTRAINT `installment_schedule_ibfk_1` FOREIGN KEY (`installment_id`) REFERENCES `installments` (`installment_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
