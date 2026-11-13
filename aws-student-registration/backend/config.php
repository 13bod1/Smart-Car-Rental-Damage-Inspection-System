<?php
// ==============================================================================
// Database Credentials - Stored Outside the Web Root (/var/www/config.php)
// Reference: Lab Architecture Diagram Footnote
// ==============================================================================

define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_USER', getenv('DB_USER') ?: 'admin');
define('DB_PASS', getenv('DB_PASSWORD') ?: 'Password123!');
define('DB_NAME', getenv('DB_NAME') ?: 'STUDENT_REGISTRATION');
define('DB_PORT', getenv('DB_PORT') ?: 3306);

define('S3_BUCKET', getenv('S3_BUCKET') ?: 'student-registration-assets');
define('AWS_REGION', getenv('AWS_REGION') ?: 'eu-north-1');

function getDBConnection() {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
    if ($mysqli->connect_errno) {
        throw new Exception("RDS MySQL Connection Failed: " . $mysqli->connect_error);
    }
    return $mysqli;
}
?>

