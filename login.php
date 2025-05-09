<?php
require 'utils.php';
require_once 'config.php';

header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password required"]);
    exit;
}

$conn = getDbConnection();
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $data->email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($data->password, $user['password'])) {
    $token = generateJWT($user['id'], $user['role']);
    echo json_encode(["token" => $token, "role" => $user['role']]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
}
?>