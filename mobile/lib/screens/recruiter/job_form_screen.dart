import 'package:flutter/material.dart';

class JobFormScreen extends StatelessWidget {
  const JobFormScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Job Form')),
      body: Center(
        child: Text('Form to create or edit a job posting.'),
      ),
    );
  }
}
