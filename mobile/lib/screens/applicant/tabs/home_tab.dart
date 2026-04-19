import 'package:flutter/material.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Jobs')),
      body: Center(
        child: Text('Applicant home feed and recommended jobs will appear here.'),
      ),
    );
  }
}
