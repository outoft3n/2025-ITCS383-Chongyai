import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../models/job.dart';
import '../../../services/api_service.dart';
import '../../../widgets/loading_overlay.dart';

class JobsTab extends StatefulWidget {
  const JobsTab({super.key});

  @override
  State<JobsTab> createState() => _JobsTabState();
}

class _JobsTabState extends State<JobsTab> {
  final ApiService _apiService = ApiService.instance;
  List<Job> _jobs = [];
  bool _isLoading = true;
  String? _error;
  int _currentPage = 1;
  int _totalPages = 1;
  int _total = 0;

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs({int page = 1}) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final jobs = await _apiService.getJobs(page: page, limit: 20);
      setState(() {
        _jobs = jobs;
        _total = jobs.length;
        _currentPage = 1;
        _totalPages = 1; // Assuming no pagination for now
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleJobActive(Job job) async {
    try {
      await _apiService.updateJob(job.id, {'isActive': !job.isActive});
      await _loadJobs(page: _currentPage);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update job: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(
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
                    onPressed: _loadJobs,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadJobs,
              child: ListView(
                padding: const EdgeInsets.only(bottom: 16),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'All Jobs',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$_total job postings',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  ..._jobs.map((job) => _buildJobCard(job)),
                ],
              ),
            ),
    );
  }

  Widget _buildJobCard(Job job) {
    final dateFormat = DateFormat('MMM d, yyyy');

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.title,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        job.location,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _buildJobTypeBadge(job.jobType),
                          const SizedBox(width: 12),
                          Text(
                            '${job.viewCount} views',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _buildStatusBadge(job.isActive),
                    const SizedBox(height: 8),
                    IconButton(
                      onPressed: () => _toggleJobActive(job),
                      icon: Icon(
                        job.isActive ? Icons.visibility_off : Icons.visibility,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      tooltip: job.isActive ? 'Deactivate' : 'Activate',
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Posted ${dateFormat.format(DateTime.parse(job.createdAt))}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobTypeBadge(String jobType) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.withOpacity(0.3)),
      ),
      child: Text(
        jobType,
        style: TextStyle(
          color: Colors.blue[700],
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildStatusBadge(bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? Colors.green.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isActive ? Colors.green.withOpacity(0.3) : Colors.grey.withOpacity(0.3),
        ),
      ),
      child: Text(
        isActive ? 'Active' : 'Inactive',
        style: TextStyle(
          color: isActive ? Colors.green[700] : Colors.grey[600],
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}