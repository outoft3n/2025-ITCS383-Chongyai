import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../models/invitation.dart';
import '../../../services/api_service.dart';
import '../../../widgets/loading_overlay.dart';

class InvitationsTab extends StatefulWidget {
  const InvitationsTab({super.key});

  @override
  State<InvitationsTab> createState() => _InvitationsTabState();
}

class _InvitationsTabState extends State<InvitationsTab> {
  final ApiService _apiService = ApiService.instance;
  List<Invitation> _invitations = [];
  bool _isLoading = true;
  String? _error;
  final Set<String> _respondingInvitationIds = {};

  @override
  void initState() {
    super.initState();
    _loadInvitations();
  }

  Future<void> _loadInvitations() async {
    _safeSetState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final invitations = await _apiService.getMyInvitations();
      _safeSetState(() {
        _invitations = invitations;
      });
    } catch (e) {
      _safeSetState(() {
        _error = e.toString();
      });
    } finally {
      _safeSetState(() {
        _isLoading = false;
      });
    }
  }

  void _safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  Future<void> _respondToInvitation(String invitationId, String status) async {
    if (_respondingInvitationIds.contains(invitationId)) {
      return;
    }

    _safeSetState(() {
      _respondingInvitationIds.add(invitationId);
    });

    try {
      await _apiService.respondToInvitation(invitationId, status);
      await _loadInvitations();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invitation ${status.toLowerCase()} successfully.')),
      );
    } catch (e) {
      if (!mounted) return;
      if (e is ApiException && e.statusCode == 409) {
        await _loadInvitations();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('This invitation has already been responded to.')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to respond: $e')),
        );
      }
    } finally {
      _safeSetState(() {
        _respondingInvitationIds.remove(invitationId);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Invitations'),
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
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadInvitations,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            : _invitations.isEmpty
                ? const Center(
                    child: Text('No job invitations yet.\nWhen recruiters invite you to apply, they\'ll appear here.'),
                  )
                : RefreshIndicator(
                    onRefresh: _loadInvitations,
                    child: ListView(
                      padding: const EdgeInsets.only(bottom: 16),
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Job Invitations',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_invitations.length} invitation(s) received',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                        ..._invitations.map((invitation) => _buildInvitationCard(invitation)),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildInvitationCard(Invitation invitation) {
    final dateFormat = DateFormat('MMM d, yyyy');
    final companyName = invitation.recruiter?['recruiterProfile']?['companyName'] ??
                       '${invitation.recruiter?['firstName']} ${invitation.recruiter?['lastName']}';

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                  child: Icon(
                    Icons.business,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        companyName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (invitation.recruiter?['recruiterProfile']?['industry'] != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          invitation.recruiter!['recruiterProfile']['industry'],
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                _buildStatusBadge(invitation.status),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    invitation.job?['title'] ?? 'Job Invitation',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      if (invitation.job?['jobType'] != null) ...[
                        Chip(
                          label: Text(
                            invitation.job!['jobType'],
                            style: const TextStyle(fontSize: 12),
                          ),
                          backgroundColor: Colors.blue.withValues(alpha: 0.1),
                          labelStyle: TextStyle(color: Colors.blue[700]),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ],
                      if (invitation.job?['location'] != null) ...[
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.location_on, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(
                              invitation.job!['location'],
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ],
                      if (invitation.job?['salaryMin'] != null || invitation.job?['salaryMax'] != null) ...[
                        Text(
                          '${invitation.job?['salaryMin'] != null ? '฿${invitation.job!['salaryMin']}' : ''}${invitation.job?['salaryMin'] != null && invitation.job?['salaryMax'] != null ? ' – ' : ''}${invitation.job?['salaryMax'] != null ? '฿${invitation.job!['salaryMax']}' : ''}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            if (invitation.message != null && invitation.message!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Message from recruiter',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '"${invitation.message}"',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Text(
                  'Received ${dateFormat.format(invitation.createdAt)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[500],
                  ),
                ),
                const Spacer(),
                if (invitation.status == 'PENDING') ...[
                  OutlinedButton.icon(
                    onPressed: () => _respondToInvitation(invitation.id, 'REJECTED'),
                    icon: Icon(Icons.close, size: 16),
                    label: Text('Decline'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      textStyle: const TextStyle(fontSize: 12),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    onPressed: () => _respondToInvitation(invitation.id, 'ACCEPTED'),
                    icon: Icon(Icons.check, size: 16),
                    label: Text('Accept'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      textStyle: const TextStyle(fontSize: 12),
                    ),
                  ),
                ] else if (invitation.status == 'ACCEPTED') ...[
                  Text(
                    'Application created — check My Applications',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.green[600],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    IconData icon;
    switch (status) {
      case 'PENDING':
        color = Colors.orange;
        icon = Icons.schedule;
        break;
      case 'ACCEPTED':
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case 'REJECTED':
        color = Colors.red;
        icon = Icons.cancel;
        break;
      default:
        color = Colors.grey;
        icon = Icons.help;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            status,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}