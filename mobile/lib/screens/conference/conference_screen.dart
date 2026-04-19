import 'package:flutter/material.dart';

class ConferenceScreen extends StatelessWidget {
  const ConferenceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Conference')),
      body: Center(
        child: Text('Conference room code, join/leave actions, and participant list are shown here.'),
      ),
    );
  }
}
