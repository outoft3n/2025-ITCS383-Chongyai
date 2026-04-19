import 'package:flutter/material.dart';

import '../../../models/application.dart';
import '../../../models/job.dart';
import '../../../services/api_service.dart';
import '../../../widgets/application_card.dart';
import '../../../widgets/loading_overlay.dart';

class ApplicantsTab extends StatefulWidget {
  const ApplicantsTab({super.key});

  @override
  State<ApplicantsTab> createState() => _ApplicantsTabState();
}

class _ApplicantsTabState extends State<ApplicantsTab> {
  final ApiService _api = ApiService.instance;
  List<Job> _jobs = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Applicants')),
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
                      FilledButton(onPressed: _loadJobs, child: const Text('Retry')),
                    ],
                  ),
                ),
              )
            : RefreshIndicator(
                onRefresh: _loadJobs,
                child: _jobs.isEmpty
                    ? ListView(
                        children: const [
                          SizedBox(height: 48),
                          Center(
                            child: Text(
                              'Post a job first, then open it here to review applicants.',
                              textAlign: TextAlign.center,
                            ),
                          ),
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
                              subtitle: Text('${_applicationCount(job)} application(s)'),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute<void>(
                                    builder: (_) => _JobApplicantsPage(job: job),
                                  ),
                                );
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

class _JobApplicantsPage extends StatefulWidget {
  const _JobApplicantsPage({required this.job});

  final Job job;

  @override
  State<_JobApplicantsPage> createState() => _JobApplicantsPageState();
}

class _JobApplicantsPageState extends State<_JobApplicantsPage> {
  final ApiService _api = ApiService.instance;
  List<Application> _applications = [];
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
      final list = await _api.getJobApplications(widget.job.id);
      _safeSetState(() => _applications = list);
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

  Future<void> _updateStatus(String applicationId, String status) async {
    try {
      await _api.updateApplicationStatus(applicationId, status);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Status updated to $status')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not update: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.job.title, maxLines: 1, overflow: TextOverflow.ellipsis),
      ),
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
            : _applications.isEmpty
                ? const Center(child: Text('No applications for this job yet.'))
                : RefreshIndicator(
                    onRefresh: _load,
                    child: ListView(
                      padding: const EdgeInsets.only(bottom: 16),
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            'Applicants',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ),
                        ..._applications.map(
                          (app) => ApplicationCard(
                            key: ValueKey(app.id),
                            application: app,
                            showApplicant: true,
                            onStatusChange: _updateStatus,
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
}
