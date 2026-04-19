import 'package:flutter/material.dart';

import '../../../models/user.dart';
import '../../../services/api_service.dart';
import '../../../widgets/admin_section_header.dart';
import '../../../widgets/loading_overlay.dart';

class UsersTab extends StatefulWidget {
  const UsersTab({super.key});

  @override
  State<UsersTab> createState() => _UsersTabState();
}

class _UsersTabState extends State<UsersTab> {
  final ApiService _api = ApiService.instance;
  List<User> _users = [];
  bool _loading = true;
  String? _error;
  String _roleFilter = 'ALL';

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
      final list = await _api.getUsers(limit: 50);
      _safeSetState(() => _users = list);
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

  List<User> get _filtered {
    if (_roleFilter == 'ALL') return _users;
    return _users.where((u) => u.role == _roleFilter).toList();
  }

  Future<void> _deleteUser(User user) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete user'),
        content: Text('Delete ${user.email}? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _api.deleteUser(user.id);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('User deleted')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final users = _filtered;
    return LoadingOverlay(
      isLoading: _loading,
      child: _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(_error!, textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  FilledButton(onPressed: _load, child: const Text('Retry')),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.only(bottom: 20),
                children: [
                  const AdminSectionHeader(
                    title: 'Users Management',
                    subtitle: 'Live user list and admin actions',
                    icon: Icons.groups_2_outlined,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Wrap(
                      spacing: 8,
                      children: ['ALL', 'APPLICANT', 'RECRUITER', 'ADMIN'].map((role) {
                        final selected = role == _roleFilter;
                        return ChoiceChip(
                          label: Text(role),
                          selected: selected,
                          onSelected: (_) => setState(() => _roleFilter = role),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (users.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(child: Text('No users found.')),
                    )
                  else
                    ...users.map(
                      (u) => Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        child: ListTile(
                          leading: CircleAvatar(child: Text(u.firstName.isNotEmpty ? u.firstName[0] : '?')),
                          title: Text('${u.firstName} ${u.lastName}'),
                          subtitle: Text('${u.email}\n${u.role}'),
                          isThreeLine: true,
                          trailing: IconButton(
                            tooltip: 'Delete user',
                            onPressed: () => _deleteUser(u),
                            icon: const Icon(Icons.delete_outline),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}
