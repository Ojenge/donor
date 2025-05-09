<?php
$host = 'localhost';             // Change if not running MySQL locally
$db   = 'analytics_dashboard';         // Your actual database name
$user = 'root';                 // Your MySQL username
$pass = 'Hermione#1989';                     // Your MySQL password (often empty for local dev)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
?>
