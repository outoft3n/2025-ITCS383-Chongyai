import 'package:flutter/material.dart';

import '../../../models/job.dart';
import '../../../services/api_service.dart';
import '../../../widgets/loading_overlay.dart';
import '../../applicant/job_detail_screen.dart';

class MyJobsTab extends StatefulWidget {
  const MyJobsTab({super.key});

  @override
  State<MyJobsTab> createState() => _MyJobsTabState();
}

class _MyJobsTabState extends State<MyJobsTab> {
  final ApiService _api = ApiService.instance;
  List<Job> _jobs = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    _safeSetState(() {
      _loading = true;
      _error = null;
    });
    try {
      final jobs = await _api.getRecruiterJobs(page: 1, limit: 50);
      _safeSetState(() => _jobs = jobs);
    } catch (e) {
      _safeSetState(() => _error = e.toString());
    } finally {
      _safeSetState(() => _loading = false);
    }
  }

  void _safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  int _applicationCount(Job job) {
    final c = job.count?['applications'];
    if (c is int) return c;
    return 0;
  }

  Future<void> _toggleActive(Job job) async {
    try {
      await _api.updateJob(job.id, {'isActive': !job.isActive});
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(job.isActive ? 'Job deactivated' : 'Job activated')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Update failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Jobs')),
      body: LoadingOverlay(
        isLoading: _loading,
        child: _error != null
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _error!,
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Theme.of(context).colorScheme.error),
                      ),
                      const SizedBox(height: 16),
                      FilledButton(onPressed: _load, child: const Text('Retry')),
                    ],
                  ),
                ),
              )
            : RefreshIndicator(
                onRefresh: _load,
                child: _jobs.isEmpty
                    ? ListView(
                        children: const [
                          SizedBox(height: 48),
                          Center(child: Text('No jobs posted yet. Use the Post Job tab to create one.')),
                        ],
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.only(bottom: 16),
                        itemCount: _jobs.length,
                        itemBuilder: (context, index) {
                          final job = _jobs[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: ListTile(
                              title: Text(job.title, maxLines: 2, overflow: TextOverflow.ellipsis),
                              subtitle: Text(
                                '${job.location} · ${job.jobType.replaceAll('_', ' ')} · ${_applicationCount(job)} applications',
                              ),
                              trailing: PopupMenuButton<String>(
                                onSelected: (value) {
                                  if (value == 'toggle') _toggleActive(job);
                                },
                                itemBuilder: (context) => [
                                  PopupMenuItem(
                                    value: 'toggle',
                                    child: Text(job.isActive ? 'Deactivate' : 'Activate'),
                                  ),
                                ],
                                child: Icon(
                                  job.isActive ? Icons.check_circle_outline : Icons.pause_circle_outline,
                                  color: job.isActive ? Colors.green : Colors.grey,
                                ),
                              ),
                              onTap: () async {
                                try {
                                  final full = await _api.getJobById(job.id);
                                  if (!context.mounted) return;
                                  await Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => JobDetailScreen(job: full),
                                    ),
                                  );
                                } catch (_) {
                                  if (!context.mounted) return;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Could not load job details.')),
                                  );
                                }
                              },
                            ),
                          );
                        },
                      ),
              ),
      ),
    );
  }
}
