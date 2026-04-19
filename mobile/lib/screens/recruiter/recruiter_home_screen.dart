import 'package:flutter/material.dart';

import 'tabs/applicants_tab.dart';
import 'tabs/interviews_tab.dart';
import 'tabs/invitations_tab.dart';
import 'tabs/my_jobs_tab.dart';
import 'tabs/post_job_tab.dart';
import 'tabs/profile_tab.dart';
import 'tabs/search_tab.dart';

class RecruiterHomeScreen extends StatefulWidget {
  const RecruiterHomeScreen({super.key});

  @override
  State<RecruiterHomeScreen> createState() => _RecruiterHomeScreenState();
}

class _RecruiterHomeScreenState extends State<RecruiterHomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _tabs = const [
    MyJobsTab(),
    PostJobTab(),
    ApplicantsTab(),
    InterviewsTab(),
    InvitationsTab(),
    SearchTab(),
    ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: _tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Recruiter Dashboard'),
          bottom: TabBar(
            isScrollable: true,
            tabs: const [
              Tab(text: 'Jobs'),
              Tab(text: 'Post Job'),
              Tab(text: 'Applicants'),
              Tab(text: 'Interviews'),
              Tab(text: 'Invitations'),
              Tab(text: 'Search'),
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
