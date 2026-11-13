<?php
// /var/www/html/api/register.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load database configuration from outside the web root
require_once __DIR__ . '/../../config.php';

try {
    $mysqli = getDBConnection();

    $fullName = $_POST['full_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $studentId = $_POST['student_id'] ?? '';
    $department = $_POST['department'] ?? 'General Engineering';
    $photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';

    if (empty($fullName) || empty($email) || empty($studentId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Full Name, Email, and Student ID are required.']);
        exit();
    }

    // Insert student record into Amazon RDS MySQL (STUDENT_REGISTRATION.students)
    $stmt = $mysqli->prepare("INSERT INTO students (full_name, email, student_id, department, photo_url) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $fullName, $email, $studentId, $department, $photoUrl);
    $stmt->execute();
    $insertId = $stmt->insert_id;

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Student registered successfully in Amazon RDS!',
        'id' => $insertId,
        'student_id' => $studentId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

