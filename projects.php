<?php
require 'utils.php';
require_once 'config.php';
requireAuth();

$conn = getDbConnection();
$sql = "SELECT * FROM projects ORDER BY year DESC";
$result = $conn->query($sql);

$projects = [];
while ($row = $result->fetch_assoc()) {
    $projects[] = $row;
}

echo json_encode($projects);
?>