import 'package:flutter/material.dart';

class SearchTab extends StatelessWidget {
  const SearchTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Search Jobs')),
      body: Center(
        child: Text('Search filters and job search results go here.'),
      ),
    );
  }
}
