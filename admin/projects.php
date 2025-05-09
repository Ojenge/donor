<?php
require '../utils.php';
requireAuth('admin');

$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST': // Add new project
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO projects (name, sector, funding_type, budget, year, completion_percent)
                                VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssiii", $data->name, $data->sector, $data->funding_type, $data->budget, $data->year, $data->completion_percent);
        $stmt->execute();
        echo json_encode(["id" => $stmt->insert_id]);
        break;

    case 'PUT': // Update existing project
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("UPDATE projects SET name=?, sector=?, funding_type=?, budget=?, year=?, completion_percent=?
                                WHERE id=?");
        $stmt->bind_param("sssiiii", $data->name, $data->sector, $data->funding_type, $data->budget, $data->year, $data->completion_percent, $data->id);
        $stmt->execute();
        echo json_encode(["status" => "updated"]);
        break;

    case 'DELETE': // Delete project
        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM projects WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(["status" => "deleted"]);
        break;
}
?>