<?php
// /var/www/html/api/students.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Load database configuration from outside the web root
require_once __DIR__ . '/../../config.php';

try {
    $mysqli = getDBConnection();
    $result = $mysqli->query("SELECT id, full_name, email, student_id, department, photo_url, created_at FROM students ORDER BY id DESC");
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }

    echo json_encode($students);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

