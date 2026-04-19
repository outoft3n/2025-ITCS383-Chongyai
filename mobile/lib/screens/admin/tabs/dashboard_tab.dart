import 'package:flutter/material.dart';

import '../../../services/api_service.dart';
import '../../../widgets/admin_section_header.dart';
import '../../../widgets/loading_overlay.dart';

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  final ApiService _api = ApiService.instance;
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _summary;
  Map<String, dynamic>? _jobs;
  Map<String, dynamic>? _applications;
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
        _api.getReportSummary(),
        _api.getReportJobs(),
        _api.getReportApplications(),
        _api.getReportUsers(),
        _api.getReportPayments(),
      ]);
      _safeSetState(() {
        _summary = results[0];
        _jobs = results[1];
        _applications = results[2];
        _users = results[3];
        _payments = results[4];
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

  int _readCount(dynamic raw) {
    if (raw is int) return raw;
    if (raw is num) return raw.toInt();
    return 0;
  }

  String _money(dynamic raw) {
    final value = _readCount(raw);
    return '฿$value';
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
                  Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: _load, child: const Text('Retry')),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.only(bottom: 24),
                children: [
                  const AdminSectionHeader(
                    title: 'Live Dashboard',
                    subtitle: 'Real-time summary from backend reports',
                    icon: Icons.auto_graph_rounded,
                  ),
                  _summaryGrid(context),
                  _simpleCard(
                    context,
                    title: 'Revenue',
                    value: _money(_payments?['totalRevenue']),
                    icon: Icons.savings_outlined,
                  ),
                  _topViewedSection(context),
                  _groupSection(context, 'Applications by Status', _applications?['byStatus'] as List<dynamic>?),
                  _groupSection(context, 'Users by Role', _users?['byRole'] as List<dynamic>?),
                  _groupSection(context, 'Payments by Status', _payments?['byStatus'] as List<dynamic>?),
                ],
              ),
            ),
    );
  }

  Widget _summaryGrid(BuildContext context) {
    final users = _summary?['users'] as Map<String, dynamic>?;
    final jobs = _summary?['jobs'] as Map<String, dynamic>?;
    final apps = _summary?['applications'] as Map<String, dynamic>?;
    final pay = _summary?['payments'] as Map<String, dynamic>?;
    final recent = _summary?['recentActivity'] as Map<String, dynamic>?;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          _metricCard(context, 'Users', _readCount(users?['total']), Icons.people_alt_outlined),
          _metricCard(context, 'Active Jobs', _readCount(jobs?['active']), Icons.work_outline),
          _metricCard(context, 'Applications', _readCount(apps?['total']), Icons.assignment_outlined),
          _metricCard(context, 'Accepted', _readCount(apps?['accepted']), Icons.task_alt_outlined),
          _metricCard(context, 'Paid Txns', _readCount(pay?['completed']), Icons.payments_outlined),
          _metricCard(context, 'New Users (7d)', _readCount(recent?['newUsers']), Icons.trending_up_outlined),
        ],
      ),
    );
  }

  Widget _topViewedSection(BuildContext context) {
    final top = (_jobs?['topViewed'] as List<dynamic>?) ?? const [];
    return Card(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Top Viewed Jobs',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            if (top.isEmpty)
              const Text('No data')
            else
              ...top.take(5).map((item) {
                final row = item as Map<String, dynamic>;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Expanded(child: Text(row['title']?.toString() ?? '-', maxLines: 1, overflow: TextOverflow.ellipsis)),
                      const SizedBox(width: 8),
                      Text('${_readCount(row['viewCount'])} views'),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _metricCard(BuildContext context, String title, int value, IconData icon) {
    final width = (MediaQuery.of(context).size.width - 44) / 2;
    return SizedBox(
      width: width,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Icon(icon, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 2),
                    Text(
                      '$value',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _simpleCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Card(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        trailing: Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _groupSection(BuildContext context, String title, List<dynamic>? data) {
    return Card(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (data == null || data.isEmpty)
              const Text('No data')
            else
              ...data.map((item) {
                final row = item as Map<String, dynamic>;
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
