import 'package:flutter/material.dart';

class MyJobsTab extends StatelessWidget {
  const MyJobsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('My Jobs')),
      body: Center(
        child: Text('Recruiter jobs and management tools appear here.'),
      ),
    );
  }
}
