<?php
// Payment Gateway Configuration for Khulna Travels

class PaymentConfig {
    // bKash Configuration (Sandbox)
    public static $bkash = [
        'sandbox' => true,
        'base_url' => 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
        'app_key' => '4f6o0cjiki2rfm34kfdadl1eqq', // Sandbox key
        'app_secret' => '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b', // Sandbox secret
        'username' => 'sandboxTokenizedUser02', // Sandbox username
        'password' => 'sandboxTokenizedUser02@12345', // Sandbox password
        'grant_type' => 'password',
        'currency' => 'BDT',
        'intent' => 'sale',
        'merchant_number' => '01770618567' // Sandbox merchant
    ];
    
    // SSLCommerz Configuration (Sandbox)
    public static $sslcommerz = [
        'sandbox' => true,
        'store_id' => 'testbox', // Sandbox store ID
        'store_password' => 'qwerty', // Sandbox password
        'base_url' => 'https://sandbox.sslcommerz.com',
        'api_url' => 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
        'validation_url' => 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
        'currency' => 'BDT',
        'success_url' => 'http://localhost:3000/payment/success',
        'fail_url' => 'http://localhost:3000/payment/failed',
        'cancel_url' => 'http://localhost:3000/payment/cancelled',
        'ipn_url' => 'http://localhost/khulna-travels-api/payment/sslcommerz/ipn.php'
    ];
    
    // Nagad Configuration (Future)
    public static $nagad = [
        'sandbox' => true,
        'enabled' => false
    ];
    
    // Rocket Configuration (Future)
    public static $rocket = [
        'sandbox' => true,
        'enabled' => false
    ];
    
    // Get configuration by gateway name
    public static function getConfig($gateway) {
        switch($gateway) {
            case 'bkash':
                return self::$bkash;
            case 'sslcommerz':
                return self::$sslcommerz;
            case 'nagad':
                return self::$nagad;
            case 'rocket':
                return self::$rocket;
            default:
                return null;
        }
    }
    
    // Update URLs for production
    public static function setProductionMode($gateway, $urls = []) {
        switch($gateway) {
            case 'bkash':
                self::$bkash['sandbox'] = false;
                self::$bkash['base_url'] = 'https://tokenized.pay.bka.sh/v1.2.0-beta';
                break;
            case 'sslcommerz':
                self::$sslcommerz['sandbox'] = false;
                self::$sslcommerz['base_url'] = 'https://securepay.sslcommerz.com';
                self::$sslcommerz['api_url'] = 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
                if(isset($urls['success_url'])) self::$sslcommerz['success_url'] = $urls['success_url'];
                if(isset($urls['fail_url'])) self::$sslcommerz['fail_url'] = $urls['fail_url'];
                if(isset($urls['cancel_url'])) self::$sslcommerz['cancel_url'] = $urls['cancel_url'];
                if(isset($urls['ipn_url'])) self::$sslcommerz['ipn_url'] = $urls['ipn_url'];
                break;
        }
    }
}
?>