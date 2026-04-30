import 'package:chongyai_mobile/models/bookmark.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Bookmark.fromJson parses nested job and toJson serializes correctly', () {
    final json = <String, dynamic>{
      'id': 'bookmark-1',
      'applicantId': 'app-1',
      'jobId': 'job-1',
      'createdAt': '2026-04-30T08:00:00.000Z',
      'job': {
        'id': 'job-1',
        'recruiterId': 'rec-1',
        'title': 'Mobile Engineer',
        'description': 'Build Flutter apps',
        'requirements': 'Dart, Flutter',
        'location': 'Bangkok',
        'jobType': 'FULL_TIME',
        'skills': ['Flutter', 'Dart'],
        'viewCount': 10,
        'isActive': true,
        'createdAt': '2026-04-29T08:00:00.000Z',
        'updatedAt': '2026-04-29T09:00:00.000Z',
      },
    };

    final bookmark = Bookmark.fromJson(json);
    final serialized = bookmark.toJson();

    expect(bookmark.id, 'bookmark-1');
    expect(bookmark.applicantId, 'app-1');
    expect(bookmark.jobId, 'job-1');
    expect(bookmark.job, isNotNull);
    expect(bookmark.job?.title, 'Mobile Engineer');
    expect(serialized['id'], 'bookmark-1');
    expect(serialized['job']?['title'], 'Mobile Engineer');
  });
}
