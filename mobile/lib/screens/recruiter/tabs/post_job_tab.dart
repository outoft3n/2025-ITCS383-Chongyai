import 'package:flutter/material.dart';

class PostJobTab extends StatelessWidget {
  const PostJobTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Post Job')),
      body: Center(
        child: Text('Job creation and editing forms will be displayed here.'),
      ),
    );
  }
}
