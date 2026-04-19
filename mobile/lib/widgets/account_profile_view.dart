import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/user.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'loading_overlay.dart';

/// Shared account screen: loads `/auth/me`, shows profile fields, logout (matches web/backend user shape).
class AccountProfileView extends StatefulWidget {
  const AccountProfileView({super.key});

  @override
  State<AccountProfileView> createState() => _AccountProfileViewState();
}

class _AccountProfileViewState extends State<AccountProfileView> {
  final ApiService _api = ApiService.instance;
  User? _user;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    _safeSetState(() {
      _loading = true;
      _error = null;
    });
    try {
      final user = await _api.fetchCurrentUser();
      _safeSetState(() => _user = user);
    } catch (e) {
      _safeSetState(() => _error = e.toString());
    } finally {
      _safeSetState(() => _loading = false);
    }
  }

  void _safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  Future<void> _logout() async {
    final auth = context.read<AuthProvider>();
    await auth.logout();
  }

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(
      isLoading: _loading,
      child: _error != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Theme.of(context).colorScheme.error),
                    ),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: _load, child: const Text('Retry')),
                  ],
                ),
              ),
            )
          : _user == null
              ? const Center(child: Text('No profile data available.'))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor:
                          Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
                      child: Text(
                        _user!.firstName.isNotEmpty
                            ? _user!.firstName[0].toUpperCase()
                            : '?',
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
                    Text(_user!.email, style: Theme.of(context).textTheme.bodyMedium),
                    if (_user!.phone != null && _user!.phone!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(_user!.phone!, style: Theme.of(context).textTheme.bodyMedium),
                    ],
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
                        subtitle: Text(
                          _user!.applicantProfile!.skills.isEmpty
                              ? 'No skills listed'
                              : _user!.applicantProfile!.skills.join(', '),
                        ),
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
                      if (_user!.applicantProfile!.preferredLocation != null)
                        ListTile(
                          title: const Text('Preferred location'),
                          subtitle: Text(_user!.applicantProfile!.preferredLocation!),
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
                      if (_user!.recruiterProfile!.companyDescription != null)
                        ListTile(
                          title: const Text('About company'),
                          subtitle: Text(_user!.recruiterProfile!.companyDescription!),
                        ),
                    ],
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: _logout,
                      icon: const Icon(Icons.logout),
                      label: const Text('Log out'),
                      style: FilledButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                      ),
                    ),
                  ],
                ),
    );
  }
}
