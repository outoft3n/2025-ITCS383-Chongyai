import 'package:flutter/material.dart';

import 'tabs/applicants_tab.dart';
import 'tabs/my_jobs_tab.dart';
import 'tabs/post_job_tab.dart';
import 'tabs/profile_tab.dart';

class RecruiterHomeScreen extends StatefulWidget {
  const RecruiterHomeScreen({super.key});

  @override
  State<RecruiterHomeScreen> createState() => _RecruiterHomeScreenState();
}

class _RecruiterHomeScreenState extends State<RecruiterHomeScreen> {
  int _currentIndex = 0;

  static const List<Widget> _tabs = [
    MyJobsTab(),
    PostJobTab(),
    ApplicantsTab(),
    ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _tabs[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.work_outline), label: 'Jobs'),
          NavigationDestination(icon: Icon(Icons.post_add), label: 'Post Job'),
          NavigationDestination(icon: Icon(Icons.people), label: 'Applicants'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
