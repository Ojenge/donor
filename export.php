<?php
require 'utils.php';
require_once 'config.php'; // or './config.php' depending on relative path

requireAuth();

header('Content-Type: text/csv');
header('Content-Disposition: attachment;filename=projects_export.csv');

$conn = getDbConnection();
$output = fopen("php://output", "w");
fputcsv($output, ['ID', 'Name', 'Sector', 'Funding Type', 'Budget', 'Year', 'Completion %']);

$result = $conn->query("SELECT * FROM projects");
while ($row = $result->fetch_assoc()) {
    fputcsv($output, $row);
}
fclose($output);
?>