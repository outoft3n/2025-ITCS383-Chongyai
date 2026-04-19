import 'package:flutter/material.dart';

import '../../../models/user.dart';
import '../../../services/api_service.dart';
import '../../../widgets/loading_overlay.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  final ApiService _apiService = ApiService.instance;
  User? _user;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final user = await _apiService.fetchCurrentUser();
      setState(() {
        _user = user;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: _error != null
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _error!,
                      style: TextStyle(color: Theme.of(context).colorScheme.error),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadProfile,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            : _user == null
                ? const Center(child: Text('No profile data available.'))
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                        child: Text(
                          _user!.firstName[0].toUpperCase(),
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '${_user!.firstName} ${_user!.lastName}',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _user!.email,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 24),
                      ListTile(
                        title: const Text('Role'),
                        subtitle: Text(_user!.role),
                      ),
                      ListTile(
                        title: const Text('Verified'),
                        subtitle: Text(_user!.isVerified ? 'Yes' : 'No'),
                      ),
                      ListTile(
                        title: const Text('Paid user'),
                        subtitle: Text(_user!.isPaid ? 'Yes' : 'No'),
                      ),
                      if (_user!.applicantProfile != null) ...[
                        const Divider(),
                        ListTile(
                          title: const Text('Skills'),
                          subtitle: Text(_user!.applicantProfile!.skills.join(', ') == ''
                              ? 'No skills listed'
                              : _user!.applicantProfile!.skills.join(', ')),
                        ),
                        if (_user!.applicantProfile!.experience != null)
                          ListTile(
                            title: const Text('Experience'),
                            subtitle: Text(_user!.applicantProfile!.experience!),
                          ),
                        if (_user!.applicantProfile!.education != null)
                          ListTile(
                            title: const Text('Education'),
                            subtitle: Text(_user!.applicantProfile!.education!),
                          ),
                      ],
                      if (_user!.recruiterProfile != null) ...[
                        const Divider(),
                        ListTile(
                          title: const Text('Company'),
                          subtitle: Text(_user!.recruiterProfile!.companyName),
                        ),
                        if (_user!.recruiterProfile!.industry != null)
                          ListTile(
                            title: const Text('Industry'),
                            subtitle: Text(_user!.recruiterProfile!.industry!),
                          ),
                        if (_user!.recruiterProfile!.website != null)
                          ListTile(
                            title: const Text('Website'),
                            subtitle: Text(_user!.recruiterProfile!.website!),
                          ),
                      ],
                    ],
                  ),
      ),
    );
  }
}
