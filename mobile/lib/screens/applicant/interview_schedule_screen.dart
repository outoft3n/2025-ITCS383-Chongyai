import 'package:flutter/material.dart';

class InterviewScheduleScreen extends StatelessWidget {
  const InterviewScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Interview Schedule')),
      body: Center(
        child: Text('Scheduled interviews and conference links will show here.'),
      ),
    );
  }
}
