import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user.dart';
import '../services/api_service.dart';
import '../core/constants/api_constants.dart';

class AuthProvider extends ChangeNotifier {
  User? currentUser;
  String? token;
  bool isLoading = false;
  String? error;

  bool get isAuthenticated => token != null;

  Future<void> loadFromStorage() async {
    isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      token = prefs.getString(ApiConstants.tokenKey);

      final userJson = prefs.getString(ApiConstants.userKey);
      if (userJson != null) {
        try {
          currentUser = User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
        } catch (_) {
          currentUser = null;
        }
      }
    } catch (error) {
      debugPrint('Warning: failed to load auth state from storage: $error');
      token = null;
      currentUser = null;
    }

    isLoading = false;
    notifyListeners();
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final response = await ApiService.instance.login(email: email, password: password);
      final data = response['data'] as Map<String, dynamic>;
      token = data['token'] as String?;
      currentUser = User.fromJson(data['user'] as Map<String, dynamic>);
      await ApiService.instance.saveToken(token!);
      await ApiService.instance.saveUser(currentUser!.toJson());
    } catch (err) {
      if (err is ApiException) {
        error = err.message;
      } else {
        error = 'Login failed. Please try again.';
      }
      token = null;
      currentUser = null;
    }

    isLoading = false;
    notifyListeners();
  }

  Future<void> register({
    required String email,
    required String password,
    required String role,
    required String firstName,
    required String lastName,
    String? companyName,
  }) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final response = await ApiService.instance.register(
        email: email,
        password: password,
        role: role,
        firstName: firstName,
        lastName: lastName,
        companyName: companyName,
      );
      final data = response['data'] as Map<String, dynamic>;
      token = data['token'] as String?;
      currentUser = User.fromJson(data['user'] as Map<String, dynamic>);
      await ApiService.instance.saveToken(token!);
      await ApiService.instance.saveUser(currentUser!.toJson());
    } catch (err) {
      if (err is ApiException) {
        error = err.message;
      } else {
        error = 'Registration failed. Please try again.';
      }
      token = null;
      currentUser = null;
    }

    isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    isLoading = true;
    notifyListeners();
    try {
      await ApiService.instance.logout();
    } catch (_) {}
    token = null;
    currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(ApiConstants.tokenKey);
    await prefs.remove(ApiConstants.userKey);
    isLoading = false;
    notifyListeners();
  }
}
