<?php
require 'utils.php';
require_once 'config.php'; // or './config.php' depending on relative path

requireAuth();

$conn = getDbConnection();
$data = [
    "bySector" => [],
    "byYear" => []
];

$result = $conn->query("SELECT sector, SUM(budget) as total FROM projects GROUP BY sector");
while ($row = $result->fetch_assoc()) {
    $data["bySector"][] = $row;
}

$result = $conn->query("SELECT year, SUM(budget) as total FROM projects GROUP BY year");
while ($row = $result->fetch_assoc()) {
    $data["byYear"][] = $row;
}

echo json_encode($data);
?>