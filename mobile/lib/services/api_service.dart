import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../core/constants/api_constants.dart';
import '../models/application.dart';
import '../models/bookmark.dart';
import '../models/job.dart';
import '../models/interview.dart';
import '../models/message.dart';
import '../models/payment.dart';
import '../models/user.dart';
import 'token_storage.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  Future<String?> _getToken() async {
    return TokenStorage.getToken();
  }

  Future<void> saveToken(String token) async {
    await TokenStorage.saveToken(token);
  }

  Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiConstants.userKey, jsonEncode(user));
  }

  Future<void> removeToken() async {
    await TokenStorage.removeToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(ApiConstants.userKey);
  }

  Future<Map<String, dynamic>> _request(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}$path');
    final token = auth ? await _getToken() : null;
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };

    final http.Response response;
    try {
      if (method == 'POST') {
        response = await http.post(uri, headers: headers, body: body != null ? jsonEncode(body) : null);
      } else if (method == 'PUT') {
        response = await http.put(uri, headers: headers, body: body != null ? jsonEncode(body) : null);
      } else if (method == 'DELETE') {
        response = await http.delete(uri, headers: headers);
      } else {
        response = await http.get(uri, headers: headers);
      }
    } catch (error) {
      throw ApiException('Unable to connect to server.');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>?;
    if (response.statusCode == 401) {
      throw ApiException(data?['error'] ?? 'Unauthorized', statusCode: 401);
    }
    if (response.statusCode >= 400) {
      throw ApiException(data?['error'] ?? 'Request failed with status ${response.statusCode}', statusCode: response.statusCode);
    }
    if (data == null) {
      throw ApiException('Invalid server response');
    }
    return data;
  }

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String role,
    required String firstName,
    required String lastName,
    String? companyName,
  }) async {
    final response = await _request('/auth/register', method: 'POST', body: {
      'email': email,
      'password': password,
      'role': role,
      'firstName': firstName,
      'lastName': lastName,
      if (companyName != null) 'companyName': companyName,
    }, auth: false);
    return response;
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _request('/auth/login', method: 'POST', body: {
      'email': email,
      'password': password,
    }, auth: false);
    return response;
  }

  Future<User> fetchCurrentUser() async {
    final response = await _request('/auth/me');
    final data = response['data'] ?? response;
    return User.fromJson(data as Map<String, dynamic>);
  }

  Future<void> logout() async {
    await _request('/auth/logout', method: 'POST');
    await removeToken();
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _request('/auth/change-password', method: 'PUT', body: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }

  Future<List<Job>> getJobs({int page = 1, int limit = 20}) async {
    final response = await _request('/jobs?page=$page&limit=$limit');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Job.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Job> getJobById(String jobId) async {
    final response = await _request('/jobs/$jobId');
    final data = response['data'] ?? response;
    return Job.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Job>> getRecruiterJobs({int page = 1, int limit = 20}) async {
    final response = await _request('/jobs/recruiter/mine?page=$page&limit=$limit');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Job.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Job> createJob(Map<String, dynamic> payload) async {
    final response = await _request('/jobs', method: 'POST', body: payload);
    final data = response['data'] ?? response;
    return Job.fromJson(data as Map<String, dynamic>);
  }

  Future<Job> updateJob(String jobId, Map<String, dynamic> payload) async {
    final response = await _request('/jobs/$jobId', method: 'PUT', body: payload);
    final data = response['data'] ?? response;
    return Job.fromJson(data as Map<String, dynamic>);
  }

  Future<void> deleteJob(String jobId) async {
    await _request('/jobs/$jobId', method: 'DELETE');
  }

  Future<Application> applyJob(String jobId, {String? coverLetter}) async {
    final response = await _request('/applications', method: 'POST', body: {
      'jobId': jobId,
      if (coverLetter != null) 'coverLetter': coverLetter,
    });
    final data = response['data'] ?? response;
    return Application.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Application>> getMyApplications() async {
    final response = await _request('/applications/mine');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Application.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Application>> getJobApplications(String jobId) async {
    final response = await _request('/applications/job/$jobId');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Application.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Application> getApplication(String applicationId) async {
    final response = await _request('/applications/$applicationId');
    final data = response['data'] ?? response;
    return Application.fromJson(data as Map<String, dynamic>);
  }

  Future<Application> updateApplicationStatus(String applicationId, String status) async {
    final response = await _request('/applications/$applicationId/status', method: 'PUT', body: {
      'status': status,
    });
    final data = response['data'] ?? response;
    return Application.fromJson(data as Map<String, dynamic>);
  }

  Future<void> withdrawApplication(String applicationId) async {
    await _request('/applications/$applicationId', method: 'DELETE');
  }

  Future<List<Interview>> getMyInterviews() async {
    final response = await _request('/interviews/mine');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Interview.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Interview> createInterview(Map<String, dynamic> payload) async {
    final response = await _request('/interviews', method: 'POST', body: payload);
    final data = response['data'] ?? response;
    return Interview.fromJson(data as Map<String, dynamic>);
  }

  Future<Interview> updateInterview(String interviewId, Map<String, dynamic> payload) async {
    final response = await _request('/interviews/$interviewId', method: 'PUT', body: payload);
    final data = response['data'] ?? response;
    return Interview.fromJson(data as Map<String, dynamic>);
  }

  Future<void> cancelInterview(String interviewId) async {
    await _request('/interviews/$interviewId', method: 'DELETE');
  }

  Future<Bookmark> addBookmark(String jobId) async {
    final response = await _request('/bookmarks', method: 'POST', body: {'jobId': jobId});
    final data = response['data'] ?? response;
    return Bookmark.fromJson(data as Map<String, dynamic>);
  }

  Future<void> removeBookmark(String jobId) async {
    await _request('/bookmarks/$jobId', method: 'DELETE');
  }

  Future<List<Bookmark>> getBookmarks() async {
    final response = await _request('/bookmarks');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Bookmark.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<bool> checkBookmark(String jobId) async {
    final response = await _request('/bookmarks/check/$jobId');
    final data = response['data'] ?? response;
    return data['bookmarked'] as bool? ?? false;
  }

  Future<List<Job>> getRecommendations() async {
    final response = await _request('/recommendations');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Job.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Job>> getSimilarJobs(String jobId) async {
    final response = await _request('/recommendations/similar/$jobId');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Job.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> initiatePayment() async {
    final response = await _request('/payments/initiate', method: 'POST');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> confirmPayment({
    required String paymentId,
    required String cardNumber,
    required int expiryMonth,
    required int expiryYear,
    required String cvv,
  }) async {
    final response = await _request('/payments/confirm', method: 'POST', body: {
      'paymentId': paymentId,
      'cardNumber': cardNumber,
      'expiryMonth': expiryMonth,
      'expiryYear': expiryYear,
      'cvv': cvv,
    });
    return response['data'] as Map<String, dynamic>;
  }

  Future<List<Payment>> getPaymentHistory() async {
    final response = await _request('/payments/history');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Payment.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Payment>> getAllPayments({int page = 1, int limit = 20}) async {
    final response = await _request('/payments/all?page=$page&limit=$limit');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Payment.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> verifyId(String citizenId) async {
    final response = await _request('/verifications/verify-id', method: 'POST', body: {'citizenId': citizenId});
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getVerificationStatus() async {
    final response = await _request('/verifications/status');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> sendChatMessage({
    required String content,
    required String sessionId,
  }) async {
    final response = await _request('/chat/message', method: 'POST', body: {
      'content': content,
      'sessionId': sessionId,
    });
    return response['data'] as Map<String, dynamic>;
  }

  Future<List<Message>> getChatHistory(String sessionId) async {
    final response = await _request('/chat/history/$sessionId');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => Message.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Map<String, dynamic>>> getChatSessions() async {
    final response = await _request('/chat/sessions');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => item as Map<String, dynamic>).toList();
  }

  Future<Map<String, dynamic>> getChatSupportStatus() async {
    final response = await _request('/chat/support-status');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createConferenceRoom({
    required String title,
    String? interviewId,
  }) async {
    final response = await _request('/conference/rooms', method: 'POST', body: {
      'title': title,
      if (interviewId != null) 'interviewId': interviewId,
    });
    return response['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getMyConferenceRooms() async {
    final response = await _request('/conference/rooms/mine');
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data.map((item) => item as Map<String, dynamic>).toList();
  }

  Future<Map<String, dynamic>> getConferenceRoom(String roomCode) async {
    final response = await _request('/conference/rooms/$roomCode');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> joinConferenceRoom(String roomCode) async {
    final response = await _request('/conference/rooms/$roomCode/join', method: 'POST');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> leaveConferenceRoom(String roomCode) async {
    final response = await _request('/conference/rooms/$roomCode/leave', method: 'POST');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getReportSummary() async {
    final response = await _request('/reports/summary');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getReportJobs() async {
    final response = await _request('/reports/jobs');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getReportApplications() async {
    final response = await _request('/reports/applications');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getReportUsers() async {
    final response = await _request('/reports/users');
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getReportPayments() async {
    final response = await _request('/reports/payments');
    return response['data'] as Map<String, dynamic>;
  }
}
