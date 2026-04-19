import 'package:flutter/material.dart';

import '../../../services/api_service.dart';
import '../../../widgets/admin_section_header.dart';
import '../../../widgets/loading_overlay.dart';

class ReportsTab extends StatefulWidget {
  const ReportsTab({super.key});

  @override
  State<ReportsTab> createState() => _ReportsTabState();
}

class _ReportsTabState extends State<ReportsTab> {
  final ApiService _api = ApiService.instance;
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _jobs;
  Map<String, dynamic>? _apps;
  Map<String, dynamic>? _users;
  Map<String, dynamic>? _payments;

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
      final results = await Future.wait([
        _api.getReportJobs(),
        _api.getReportApplications(),
        _api.getReportUsers(),
        _api.getReportPayments(),
      ]);
      _safeSetState(() {
        _jobs = results[0];
        _apps = results[1];
        _users = results[2];
        _payments = results[3];
      });
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

  int _readCount(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(
      isLoading: _loading,
      child: _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(_error!, textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  FilledButton(onPressed: _load, child: const Text('Retry')),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.only(bottom: 20),
                children: [
                  const AdminSectionHeader(
                    title: 'Reports Center',
                    subtitle: 'Jobs, users, applications and payment analytics',
                    icon: Icons.insights_outlined,
                  ),
                  _groupCard('Jobs by Type', _jobs?['byType'] as List<dynamic>?),
                  _groupCard('Applications by Status', _apps?['byStatus'] as List<dynamic>?),
                  _groupCard('Users by Role', _users?['byRole'] as List<dynamic>?),
                  _groupCard('Payments by Status', _payments?['byStatus'] as List<dynamic>?),
                ],
              ),
            ),
    );
  }

  Widget _groupCard(String title, List<dynamic>? list) {
    return Card(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            if (list == null || list.isEmpty)
              const Text('No data')
            else
              ...list.map((entry) {
                final row = entry as Map<String, dynamic>;
                final label = row['status']?.toString() ?? row['role']?.toString() ?? row['jobType']?.toString() ?? '-';
                final countMap = row['_count'] as Map<String, dynamic>?;
                final count = _readCount(countMap?['id']);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Expanded(child: Text(label)),
                      Text('$count'),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
