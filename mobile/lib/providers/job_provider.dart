import 'package:flutter/material.dart';

import '../models/job.dart';
import '../services/api_service.dart';

class JobProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService.instance;

  List<Job> jobs = [];
  List<Job> recommendations = [];
  List<Job> similarJobs = [];
  bool isLoading = false;
  String? error;

  Future<void> loadJobs({int page = 1, int limit = 20}) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      jobs = await _apiService.getJobs(page: page, limit: limit);
    } catch (err) {
      if (err is ApiException) {
        error = err.message;
      } else {
        error = 'Failed to load jobs';
      }
    }

    isLoading = false;
    notifyListeners();
  }

  Future<void> loadRecommendations() async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      recommendations = await _apiService.getRecommendations();
    } catch (err) {
      if (err is ApiException) {
        error = err.message;
      } else {
        error = 'Failed to load recommendations';
      }
    }

    isLoading = false;
    notifyListeners();
  }

  Future<void> loadSimilarJobs(String jobId) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      similarJobs = await _apiService.getSimilarJobs(jobId);
    } catch (err) {
      if (err is ApiException) {
        error = err.message;
      } else {
        error = 'Failed to load similar jobs';
      }
    }

    isLoading = false;
    notifyListeners();
  }
}
