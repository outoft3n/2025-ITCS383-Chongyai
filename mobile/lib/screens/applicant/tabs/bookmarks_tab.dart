import 'package:flutter/material.dart';

class BookmarksTab extends StatelessWidget {
  const BookmarksTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Bookmarks')),
      body: Center(
        child: Text('Saved jobs will appear in this tab.'),
      ),
    );
  }
}
