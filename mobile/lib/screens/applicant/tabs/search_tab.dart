import 'package:flutter/material.dart';

import '../../../models/job.dart';
import '../../../services/api_service.dart';
import '../../../widgets/job_card.dart';
import '../../../widgets/loading_overlay.dart';
import '../job_detail_screen.dart';

class SearchTab extends StatefulWidget {
  const SearchTab({super.key});

  @override
  State<SearchTab> createState() => _SearchTabState();
}

class _SearchTabState extends State<SearchTab> {
  final ApiService _apiService = ApiService.instance;
  final TextEditingController _searchController = TextEditingController();
  List<Job> _searchResults = [];
  bool _isLoading = false;
  String? _error;

  Future<void> _searchJobs() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _error = 'Enter a search term to find jobs.';
        _searchResults = [];
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final results = await _apiService.searchJobs(q: query, page: 1, limit: 20);
      setState(() {
        _searchResults = results;
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
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Jobs'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: RefreshIndicator(
          onRefresh: _searchJobs,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  labelText: 'Search jobs',
                  hintText: 'Keyword, role, or location',
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.search),
                    onPressed: _searchJobs,
                  ),
                ),
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => _searchJobs(),
              ),
              const SizedBox(height: 16),
              if (_error != null)
                Text(
                  _error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              if (_searchResults.isEmpty && _error == null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  child: Text(
                    'Type a keyword and tap search to load jobs from the backend.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ..._searchResults.map(
                (job) => JobCard(
                  key: ValueKey(job.id),
                  job: job,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => JobDetailScreen(job: job),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
