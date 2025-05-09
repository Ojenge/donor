<?php
require_once 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getDbConnection() {
    return new mysqli('localhost', 'root', '', 'analytics_dashboard');
}

function generateJWT($userId, $role) {
    $key = 'your-secret-key';
    $payload = [
        'sub' => $userId,
        'role' => $role,
        'exp' => time() + 3600
    ];
    return JWT::encode($payload, $key, 'HS256');
}

function requireAuth($requiredRole = null) {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["error" => "Missing token"]);
        exit;
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    try {
        $decoded = JWT::decode($token, new Key('your-secret-key', 'HS256'));
        if ($requiredRole && $decoded->role !== $requiredRole) {
            http_response_code(403);
            echo json_encode(["error" => "Access denied"]);
            exit;
        }
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid token"]);
        exit;
    }
}
?>