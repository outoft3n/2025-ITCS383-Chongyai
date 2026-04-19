import 'package:flutter/material.dart';

class ApplicantDetailScreen extends StatelessWidget {
  const ApplicantDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Applicant Detail')),
      body: Center(
        child: Text('Applicant profile details and application history appear here.'),
      ),
    );
  }
}
