class ApiConstants {
  // For Android Emulator: use 10.0.2.2
  // Default to the public backend API for web / Codespace usage
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://two025-itcs383-chongyai.onrender.com/api',
  );
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
}
