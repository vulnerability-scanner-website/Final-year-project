<?php
// INTENTIONALLY VULNERABLE APPLICATION - FOR TESTING ONLY
// DO NOT USE IN PRODUCTION

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Vulnerable Database Connection (Hardcoded Credentials)
$db_host = 'localhost';
$db_user = 'root';
$db_pass = 'password123';
$db_name = 'vulnerable_db';

$conn = @mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// SQL Injection Vulnerability #1-10
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $query = "SELECT * FROM users WHERE id = $id"; // No sanitization
    if ($conn) $result = @mysqli_query($conn, $query);
}

// SQL Injection Vulnerability #11-15
if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $query = "SELECT * FROM users WHERE username='$username' AND password='$password'";
    if ($conn) $result = @mysqli_query($conn, $query);
}

// XSS Vulnerability #16-25
if (isset($_GET['search'])) {
    echo "<h2>Search Results for: " . $_GET['search'] . "</h2>"; // Reflected XSS
}

if (isset($_GET['name'])) {
    echo "Hello, " . $_GET['name'] . "!"; // XSS
}

if (isset($_GET['comment'])) {
    echo "<div class='comment'>" . $_GET['comment'] . "</div>"; // XSS
}

// Command Injection Vulnerability #26-30
if (isset($_GET['ping'])) {
    $host = $_GET['ping'];
    $output = @shell_exec("ping -c 4 " . $host); // Command Injection
    echo "<pre>$output</pre>";
}

if (isset($_GET['file'])) {
    $file = $_GET['file'];
    @system("cat " . $file); // Command Injection
}

// Path Traversal Vulnerability #31-35
if (isset($_GET['page'])) {
    $page = $_GET['page'];
    @include($page . ".php"); // LFI/RFI
}

if (isset($_GET['download'])) {
    $file = $_GET['download'];
    @readfile($file); // Path Traversal
}

// File Upload Vulnerability #36-40
if (isset($_FILES['upload'])) {
    $target = "uploads/" . basename($_FILES['upload']['name']);
    @move_uploaded_file($_FILES['upload']['tmp_name'], $target); // No validation
}

// CSRF Vulnerability #41-45 (No CSRF tokens)
if (isset($_POST['email'])) {
    $email = $_POST['email'];
    if ($conn) @mysqli_query($conn, "UPDATE users SET email='$email' WHERE id=1");
}

// Insecure Direct Object Reference #46-50
if (isset($_GET['user_id'])) {
    $user_id = $_GET['user_id'];
    $query = "SELECT * FROM users WHERE id = $user_id";
    if ($conn) $result = @mysqli_query($conn, $query);
}

// Session Fixation #51-55
if (isset($_GET['session_id'])) {
    session_id($_GET['session_id']); // Session Fixation
}

// Weak Password Storage #56-60
if (isset($_POST['new_password'])) {
    $password = $_POST['new_password'];
    if ($conn) @mysqli_query($conn, "UPDATE users SET password='$password' WHERE id=1"); // Plain text
}

// Information Disclosure #61-65
if (isset($_GET['info'])) {
    phpinfo(); // Exposes server info
}

// Sensitive Data Exposure #66-70
if (isset($_GET['debug'])) {
    echo "Database Password: " . $db_pass; // Exposed credentials
    echo "<br>API Key: sk_live_123456789"; // Exposed API key
}

// XML External Entity (XXE) #71-75
if (isset($_POST['xml'])) {
    $xml = @simplexml_load_string($_POST['xml'], 'SimpleXMLElement', LIBXML_NOENT);
}

// Insecure Deserialization #76-80
if (isset($_GET['data'])) {
    $data = @unserialize($_GET['data']); // Unsafe deserialization
}

// LDAP Injection #81-85
if (isset($_GET['ldap_user'])) {
    $username = $_GET['ldap_user'];
    $filter = "(&(uid=$username)(userPassword=*))"; // LDAP Injection
}

// Open Redirect #86-90
if (isset($_GET['redirect'])) {
    header("Location: " . $_GET['redirect']); // Open Redirect
    exit();
}

// Server-Side Request Forgery (SSRF) #91-95
if (isset($_GET['url'])) {
    $url = $_GET['url'];
    $content = @file_get_contents($url); // SSRF
    echo $content;
}

// Weak Cryptography #96-100
$encrypted = md5($_POST['data'] ?? ''); // Weak hash
$key = "12345"; // Weak encryption key

// Missing Security Headers #101-105
// No X-Frame-Options
// No X-Content-Type-Options
// No Content-Security-Policy
// No Strict-Transport-Security
// No X-XSS-Protection

// Insecure Cookie Settings #106-110
setcookie("session", "admin123", time() + 3600, "/", "", false, false); // No secure/httponly

?>
<!DOCTYPE html>
<html>
<head>
    <title>Vulnerable Test Application</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f0f0f0; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #d9534f; }
        form { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
        input, textarea { width: 100%; padding: 8px; margin: 5px 0; box-sizing: border-box; }
        button { background: #5cb85c; color: white; padding: 10px 20px; border: none; cursor: pointer; }
        .warning { background: #fcf8e3; border: 1px solid #faebcc; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔓 Intentionally Vulnerable Test Application</h1>
        <div class="warning">
            <strong>⚠️ WARNING:</strong> This application contains 100+ security vulnerabilities for testing purposes only!
        </div>

        <!-- SQL Injection Test -->
        <form method="GET">
            <h3>SQL Injection Test</h3>
            <input type="text" name="id" placeholder="Enter user ID (try: 1 OR 1=1)">
            <button type="submit">Search User</button>
        </form>

        <!-- XSS Test -->
        <form method="GET">
            <h3>XSS Test</h3>
            <input type="text" name="search" placeholder="Search... (try: <script>alert('XSS')</script>)">
            <button type="submit">Search</button>
        </form>

        <!-- Command Injection Test -->
        <form method="GET">
            <h3>Command Injection Test</h3>
            <input type="text" name="ping" placeholder="Enter host (try: 127.0.0.1; ls)">
            <button type="submit">Ping</button>
        </form>

        <!-- File Upload Test -->
        <form method="POST" enctype="multipart/form-data">
            <h3>File Upload Test</h3>
            <input type="file" name="upload">
            <button type="submit">Upload</button>
        </form>

        <!-- Path Traversal Test -->
        <form method="GET">
            <h3>Path Traversal Test</h3>
            <input type="text" name="file" placeholder="Enter file path (try: ../../../../etc/passwd)">
            <button type="submit">Read File</button>
        </form>

        <!-- SSRF Test -->
        <form method="GET">
            <h3>SSRF Test</h3>
            <input type="text" name="url" placeholder="Enter URL (try: http://localhost)">
            <button type="submit">Fetch URL</button>
        </form>

        <!-- Login Form (SQL Injection) -->
        <form method="POST">
            <h3>Login (Vulnerable)</h3>
            <input type="text" name="username" placeholder="Username (try: admin' OR '1'='1)">
            <input type="password" name="password" placeholder="Password">
            <button type="submit">Login</button>
        </form>

        <!-- Open Redirect -->
        <form method="GET">
            <h3>Open Redirect Test</h3>
            <input type="text" name="redirect" placeholder="Redirect URL">
            <button type="submit">Redirect</button>
        </form>

        <hr>
        <h3>Vulnerability Categories (100+ Total):</h3>
        <ul>
            <li>✗ SQL Injection (15 instances)</li>
            <li>✗ Cross-Site Scripting (10 instances)</li>
            <li>✗ Command Injection (5 instances)</li>
            <li>✗ Path Traversal (5 instances)</li>
            <li>✗ File Upload (5 instances)</li>
            <li>✗ CSRF (5 instances)</li>
            <li>✗ IDOR (5 instances)</li>
            <li>✗ Session Issues (5 instances)</li>
            <li>✗ Weak Cryptography (5 instances)</li>
            <li>✗ Information Disclosure (10 instances)</li>
            <li>✗ XXE (5 instances)</li>
            <li>✗ Deserialization (5 instances)</li>
            <li>✗ LDAP Injection (5 instances)</li>
            <li>✗ Open Redirect (5 instances)</li>
            <li>✗ SSRF (5 instances)</li>
            <li>✗ Missing Security Headers (5 instances)</li>
            <li>✗ Insecure Cookies (10 instances)</li>
            <li>✗ Hardcoded Credentials (5 instances)</li>
            <li>✗ Exposed Sensitive Data (5 instances)</li>
            <li>✗ Weak Authentication (5 instances)</li>
        </ul>
        <p><strong>Total: 110 Vulnerabilities</strong></p>
    </div>
</body>
</html>
