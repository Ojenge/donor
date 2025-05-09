<?php
$host = 'localhost';
$db   = 'analytics_dashboard';
$port = '3306';
$charset = 'utf8mb4';
$user = 'root';
$pass = 'Hermione#1989';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    echo "✅ Database connection successful.";
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage();
}
?>
