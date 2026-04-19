import 'package:flutter/material.dart';

import 'tabs/dashboard_tab.dart';
import 'tabs/jobs_tab.dart';
import 'tabs/payments_tab.dart';
import 'tabs/profile_tab.dart';
import 'tabs/reports_tab.dart';
import 'tabs/users_tab.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  final List<Widget> _tabs = const [
    DashboardTab(),
    JobsTab(),
    PaymentsTab(),
    UsersTab(),
    ReportsTab(),
    ProfileTab(),
  ];
  static const _tabItems = <({String label, IconData icon})>[
    (label: 'Overview', icon: Icons.dashboard_outlined),
    (label: 'Jobs', icon: Icons.work_outline),
    (label: 'Payments', icon: Icons.payments_outlined),
    (label: 'Users', icon: Icons.group_outlined),
    (label: 'Reports', icon: Icons.bar_chart_outlined),
    (label: 'Account', icon: Icons.person_outline),
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return DefaultTabController(
      length: _tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Admin Dashboard'),
          elevation: 0,
          scrolledUnderElevation: 0,
          surfaceTintColor: Colors.transparent,
          bottom: TabBar(
            isScrollable: true,
            dividerColor: Colors.transparent,
            tabAlignment: TabAlignment.start,
            labelPadding: const EdgeInsets.symmetric(horizontal: 6),
            padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
            indicator: BoxDecoration(
              color: scheme.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: scheme.primary.withValues(alpha: 0.25),
              ),
            ),
            tabs: _tabItems
                .map(
                  (item) => Tab(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(item.icon, size: 18),
                          const SizedBox(width: 6),
                          Text(item.label),
                        ],
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ),
        body: TabBarView(
          children: _tabs,
        ),
      ),
    );
  }
}
