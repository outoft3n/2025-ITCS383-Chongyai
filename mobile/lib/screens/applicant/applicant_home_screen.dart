import 'package:flutter/material.dart';

import 'tabs/applications_tab.dart';
import 'tabs/bookmarks_tab.dart';
import 'tabs/home_tab.dart';
import 'tabs/interviews_tab.dart';
import 'tabs/invitations_tab.dart';
import 'tabs/profile_tab.dart';
import 'tabs/search_tab.dart';

class ApplicantHomeScreen extends StatefulWidget {
  const ApplicantHomeScreen({super.key});

  @override
  State<ApplicantHomeScreen> createState() => _ApplicantHomeScreenState();
}

class _ApplicantHomeScreenState extends State<ApplicantHomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _tabs = const [
    HomeTab(),
    SearchTab(),
    ApplicationsTab(),
    InterviewsTab(),
    InvitationsTab(),
    BookmarksTab(),
    ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _tabs[_currentIndex],
      bottomNavigationBar: NavigationBar(
        labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
        height: 68,
        selectedIndex: _currentIndex,
        onDestinationSelected: (value) => setState(() {
          _currentIndex = value;
        }),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Search'),
          NavigationDestination(icon: Icon(Icons.work), label: 'Applications'),
          NavigationDestination(icon: Icon(Icons.calendar_today), label: 'Interviews'),
          NavigationDestination(icon: Icon(Icons.mail), label: 'Invitations'),
          NavigationDestination(icon: Icon(Icons.bookmark), label: 'Bookmarks'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
