import 'package:flutter/material.dart';

import '../../../models/job.dart';
import '../../../services/api_service.dart';
import '../../../widgets/job_card.dart';
import '../../../widgets/loading_overlay.dart';
import '../job_detail_screen.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  final ApiService _apiService = ApiService.instance;
  List<Job> _jobs = [];
  bool _isLoading = true;
  String? _error;
  bool _usingPublicJobFallback = false;
  final Set<String> _bookmarkedJobIds = {};

  @override
  void initState() {
    super.initState();
    _loadRecommendations();
  }

  Future<void> _loadRecommendations() async {
    _safeSetState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final jobs = await _apiService.getRecommendations();
      _safeSetState(() {
        _jobs = jobs;
        _usingPublicJobFallback = false;
      });
    } catch (e) {
      if (e is ApiException && e.statusCode == 402) {
        try {
          final jobs = await _apiService.getJobs(page: 1, limit: 20);
          _safeSetState(() {
            _jobs = jobs;
            _error = null;
            _usingPublicJobFallback = true;
          });
        } catch (e2) {
          _safeSetState(() {
            _error = e2.toString();
            _usingPublicJobFallback = false;
          });
        }
      } else {
        _safeSetState(() {
          _error = e.toString();
          _usingPublicJobFallback = false;
        });
      }
    } finally {
      _safeSetState(() {
        _isLoading = false;
      });
    }
  }

  void _safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  Future<void> _toggleBookmark(Job job) async {
    final already = _bookmarkedJobIds.contains(job.id);
    try {
      if (already) {
        await _apiService.removeBookmark(job.id);
      } else {
        await _apiService.addBookmark(job.id);
      }
      _safeSetState(() {
        if (already) {
          _bookmarkedJobIds.remove(job.id);
        } else {
          _bookmarkedJobIds.add(job.id);
        }
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(already ? 'Bookmark removed' : 'Bookmarked')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Bookmark failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: _error != null
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _error!,
                      style: TextStyle(color: Theme.of(context).colorScheme.error),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadRecommendations,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            : RefreshIndicator(
                onRefresh: _loadRecommendations,
                child: ListView(
                  padding: const EdgeInsets.only(bottom: 16),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _usingPublicJobFallback ? 'Latest jobs' : 'Recommended jobs',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _usingPublicJobFallback
                                ? 'Personalized recommendations need a paid plan. Showing open listings from the API instead.'
                                : 'Jobs hand-picked for you from the backend.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                          ),
                        ],
                      ),
                    ),
                    if (_jobs.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                        child: Text(
                          'No recommended jobs available yet. Pull down to refresh.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      )
                    else ..._jobs.map(
                      (job) => JobCard(
                        key: ValueKey(job.id),
                        job: job,
                        isBookmarked: _bookmarkedJobIds.contains(job.id),
                        onBookmark: () => _toggleBookmark(job),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => JobDetailScreen(job: job),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
