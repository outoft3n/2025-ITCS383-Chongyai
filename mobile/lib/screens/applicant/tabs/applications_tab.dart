import 'package:flutter/material.dart';

class ApplicationsTab extends StatelessWidget {
  const ApplicationsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('My Applications')),
      body: Center(
        child: Text('Application status and workflow will be shown here.'),
      ),
    );
  }
}
