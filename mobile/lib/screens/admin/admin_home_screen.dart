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

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: _tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Admin Dashboard'),
          bottom: TabBar(
            isScrollable: true,
            tabs: const [
              Tab(text: 'Dashboard'),
              Tab(text: 'Jobs'),
              Tab(text: 'Payments'),
              Tab(text: 'Users'),
              Tab(text: 'Reports'),
              Tab(text: 'Profile'),
            ],
          ),
        ),
        body: TabBarView(
          children: _tabs,
        ),
      ),
    );
  }
}
