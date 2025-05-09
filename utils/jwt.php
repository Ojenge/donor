<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$JWT_SECRET = 'your_super_secret_key';

function encodeJWT($payload) {
    global $JWT_SECRET;
    return JWT::encode($payload, $JWT_SECRET, 'HS256');
}

function decodeJWT($token) {
    global $JWT_SECRET;
    return JWT::decode($token, new Key($JWT_SECRET, 'HS256'));
}
?>
