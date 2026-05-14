<?php
/**
 * Naxora Configuration (For reference only in this preview)
 * Deployment to aaPanel requires PHP 8.2 + MySQL
 */

$host = "localhost";
$user = "ISI_USER_DATABASE";
$pass = "ISI_PASSWORD_DATABASE";
$db   = "ISI_NAMA_DATABASE";

// Connect
$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
?>
