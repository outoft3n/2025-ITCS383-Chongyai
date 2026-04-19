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
  final List<Widget> _tabs = const [
    MyJobsTab(),
    PostJobTab(),
    ApplicantsTab(),
    InterviewsTab(),
    InvitationsTab(),
    SearchTab(),
    ProfileTab(),
  ];
  static const _tabItems = <({String label, IconData icon})>[
    (label: 'Jobs', icon: Icons.work_outline),
    (label: 'Post', icon: Icons.add_business_outlined),
    (label: 'Applicants', icon: Icons.groups_outlined),
    (label: 'Interviews', icon: Icons.event_note_outlined),
    (label: 'Invites', icon: Icons.mark_email_unread_outlined),
    (label: 'Search', icon: Icons.manage_search_outlined),
    (label: 'Account', icon: Icons.person_outline),
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return DefaultTabController(
      length: _tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Recruiter Dashboard'),
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
          children: _tabs.map((tab) {
            return AnimatedSwitcher(
              duration: const Duration(milliseconds: 180),
              child: tab,
            );
          }).toList(),
        ),
      ),
    );
  }
}
