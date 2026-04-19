import 'package:flutter/material.dart';

class ReportsTab extends StatelessWidget {
  const ReportsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Reports')),
      body: Center(
        child: Text('Detailed reports for jobs, applications, payments, and users.'),
      ),
    );
  }
}
