import 'package:flutter/material.dart';

import '../../../services/api_service.dart';

class PostJobTab extends StatefulWidget {
  const PostJobTab({super.key});

  @override
  State<PostJobTab> createState() => _PostJobTabState();
}

class _PostJobTabState extends State<PostJobTab> {
  final ApiService _api = ApiService.instance;
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _requirements = TextEditingController();
  final _location = TextEditingController();
  final _salaryMin = TextEditingController();
  final _salaryMax = TextEditingController();
  final _skills = TextEditingController();
  String _jobType = 'FULL_TIME';
  bool _submitting = false;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _requirements.dispose();
    _location.dispose();
    _salaryMin.dispose();
    _salaryMax.dispose();
    _skills.dispose();
    super.dispose();
  }

  int? _parseInt(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return null;
    return int.tryParse(trimmed);
  }

  Future<void> _submit() async {
    if (_submitting) return;
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _submitting = true);
    try {
      final skills = _skills.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();
      await _api.createJob({
        'title': _title.text.trim(),
        'description': _description.text.trim(),
        'requirements': _requirements.text.trim(),
        'location': _location.text.trim(),
        'jobType': _jobType,
        'salaryMin': _parseInt(_salaryMin.text),
        'salaryMax': _parseInt(_salaryMax.text),
        'skills': skills,
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Job created')),
      );
      _formKey.currentState?.reset();
      _title.clear();
      _description.clear();
      _requirements.clear();
      _location.clear();
      _salaryMin.clear();
      _salaryMax.clear();
      _skills.clear();
      setState(() => _jobType = 'FULL_TIME');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Create job failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Post Job')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _title,
                  decoration: const InputDecoration(
                    labelText: 'Title',
                    border: OutlineInputBorder(),
                  ),
                  validator: (v) => (v == null || v.trim().length < 3) ? 'Title is required (min 3 chars)' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _description,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 4,
                  validator: (v) => (v == null || v.trim().length < 10) ? 'Description is required (min 10 chars)' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _requirements,
                  decoration: const InputDecoration(
                    labelText: 'Requirements',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 4,
                  validator: (v) => (v == null || v.trim().length < 10) ? 'Requirements is required (min 10 chars)' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _location,
                  decoration: const InputDecoration(
                    labelText: 'Location',
                    border: OutlineInputBorder(),
                  ),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Location is required' : null,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _jobType,
                  decoration: const InputDecoration(
                    labelText: 'Job type',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'FULL_TIME', child: Text('FULL_TIME')),
                    DropdownMenuItem(value: 'PART_TIME', child: Text('PART_TIME')),
                    DropdownMenuItem(value: 'CONTRACT', child: Text('CONTRACT')),
                    DropdownMenuItem(value: 'INTERNSHIP', child: Text('INTERNSHIP')),
                    DropdownMenuItem(value: 'REMOTE', child: Text('REMOTE')),
                  ],
                  onChanged: (value) => setState(() => _jobType = value ?? 'FULL_TIME'),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _salaryMin,
                        decoration: const InputDecoration(
                          labelText: 'Salary min (optional)',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _salaryMax,
                        decoration: const InputDecoration(
                          labelText: 'Salary max (optional)',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _skills,
                  decoration: const InputDecoration(
                    labelText: 'Skills (comma-separated, optional)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _submitting ? null : _submit,
                    icon: const Icon(Icons.add),
                    label: Text(_submitting ? 'Creating…' : 'Create job'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
