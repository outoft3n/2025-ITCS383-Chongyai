import 'package:flutter/material.dart';

class ApplicantsTab extends StatelessWidget {
  const ApplicantsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Applicants')),
      body: Center(
        child: Text('List of applicants per job and application review screens go here.'),
      ),
    );
  }
}
