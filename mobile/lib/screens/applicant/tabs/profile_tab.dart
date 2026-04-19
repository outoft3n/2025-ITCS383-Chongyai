import 'package:flutter/material.dart';

import '../../../widgets/account_profile_view.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Account'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: const AccountProfileView(),
    );
  }
}
