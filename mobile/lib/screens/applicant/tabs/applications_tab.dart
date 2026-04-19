import 'package:flutter/material.dart';

import '../../../models/application.dart';
import '../../../services/api_service.dart';
import '../../../widgets/application_card.dart';
import '../../../widgets/loading_overlay.dart';

class ApplicationsTab extends StatefulWidget {
  const ApplicationsTab({super.key});

  @override
  State<ApplicationsTab> createState() => _ApplicationsTabState();
}

class _ApplicationsTabState extends State<ApplicationsTab> {
  final ApiService _apiService = ApiService.instance;
  List<Application> _applications = [];
  bool _isLoading = true;
  String? _error;
  int _total = 0;

  @override
  void initState() {
    super.initState();
    _loadApplications();
  }

  Future<void> _loadApplications() async {
    _safeSetState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final applications = await _apiService.getMyApplications();
      _safeSetState(() {
        _applications = applications;
        _total = applications.length;
      });
    } catch (e) {
      _safeSetState(() {
        _error = e.toString();
      });
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications'),
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
                      onPressed: _loadApplications,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            : _applications.isEmpty
                ? const Center(
                    child: Text('No applications yet. Start applying for jobs!'),
                  )
                : RefreshIndicator(
                    onRefresh: _loadApplications,
                    child: ListView(
                      padding: const EdgeInsets.only(bottom: 16),
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'My Applications',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Track the status of all your job applications',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                '$_total applications',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                        ),
                        ..._applications.map((application) => ApplicationCard(
                          key: ValueKey(application.id),
                          application: application,
                        )),
                      ],
                    ),
                  ),
      ),
    );
  }
}
